import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { getRepositoryById } from "@/lib/data/dashboard-data-facade";
import { emitIntegrationEvent, type IntegrationEventPayload } from "@/lib/integrations/integration-events";
import { requireSessionUserId } from "@/lib/auth/session";
import {
  evaluateGitHubGate,
  listGitHubGates,
  recordContractValidationResult,
  recordGitHubPrCommentPosted,
  setGitHubCheckStatus,
  type CheckStatus,
} from "@/lib/analytics/governance-data";

type Status = "success" | "failed" | "pending";
type ContractIssue = { code?: string; message: string };

function toContractIssues(input: unknown): ContractIssue[] {
  if (!Array.isArray(input)) return [];
  const issues: ContractIssue[] = [];
  for (const item of input) {
    if (typeof item === "string" && item.trim()) {
      issues.push({ message: item.trim() });
      continue;
    }
    if (item && typeof item === "object") {
      const raw = item as Record<string, unknown>;
      const message = typeof raw.message === "string" ? raw.message.trim() : "";
      if (!message) continue;
      const code = typeof raw.code === "string" ? raw.code.trim() : undefined;
      issues.push({ code, message });
    }
  }
  return issues;
}

function remediationFor(code?: string): string | null {
  switch (code) {
    case "MISSING_OUTPUT_CONTRACT":
      return "Add frontmatter.output_contract with format, schema, quality_gates, artifacts, and exit_criteria.";
    case "MISSING_OUTPUT_CONTRACT_FIELD":
      return "Fill every required output_contract field and keep names stable across tasks.";
    case "INVALID_OUTPUT_CONTRACT_SCHEMA":
    case "INVALID_OUTPUT_CONTRACT_SCHEMA_ENTRY":
    case "INVALID_OUTPUT_CONTRACT_SCHEMA_TYPE":
    case "OUTPUT_SCHEMA_MISSING_KEY":
    case "OUTPUT_SCHEMA_TYPE_MISMATCH":
      return "Align produced JSON keys/types with output_contract.schema and rerun `agentmd check --contract --output`.";
    case "OUTPUT_QUALITY_GATE_FAILED":
      return "Resolve failing quality gates and set quality_gates.<gate>=true only after verification.";
    case "OUTPUT_ARTIFACT_MISSING":
      return "Produce every declared artifact or update output_contract.artifacts to the canonical artifact IDs.";
    case "OUTPUT_EXIT_CRITERIA_UNMET":
      return "Ensure all exit criteria evaluate true before marking the run complete.";
    default:
      return null;
  }
}

function parseDetailAfterColon(message: string) {
  const idx = message.indexOf(":");
  if (idx < 0) return message.trim();
  return message.slice(idx + 1).trim();
}

function buildSummary(input: {
  repositoryName: string;
  pullRequestNumber: number;
  requiredChecks: string[];
  checks: Record<string, CheckStatus>;
  gateDecision: ReturnType<typeof evaluateGitHubGate>;
  contractErrors: ContractIssue[];
}) {
  const checkRows = input.requiredChecks.map(
    (check) => `- ${check}: ${input.checks[check] ?? "missing"}`
  );
  const remediations = Array.from(
    new Set(input.contractErrors.map((issue) => remediationFor(issue.code)).filter(Boolean))
  ) as string[];
  const contractRows = input.contractErrors.map(
    (issue) => `- ${issue.code ? `[${issue.code}] ` : ""}${issue.message}`
  );

  const lines = [
    `AgentMD merge gate report for ${input.repositoryName}#${input.pullRequestNumber}`,
    "",
    "Required checks:",
    ...checkRows,
    "",
  ];

  if (input.gateDecision.pass) {
    lines.push("Merge gate: PASS.");
  } else {
    lines.push("Merge gate: BLOCKED.");
    lines.push(...input.gateDecision.blockedReasons.map((reason) => `- ${reason}`));
  }

  if (contractRows.length > 0) {
    lines.push("");
    lines.push("Contract validation issues:");
    lines.push(...contractRows);
  }

  if (remediations.length > 0) {
    lines.push("");
    lines.push("Suggested fixes:");
    lines.push(...remediations.map((tip) => `- ${tip}`));
  }

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
    }
    const body = raw as Record<string, unknown>;
    const repositoryId =
      typeof body.repositoryId === "string" ? body.repositoryId.trim() : undefined;
    const pullRequestNumber = Number(body.pullRequestNumber);
    const checks =
      body.checks && typeof body.checks === "object" && !Array.isArray(body.checks)
        ? (body.checks as Record<string, unknown>)
        : undefined;
    const postComment = body.postComment === true;
    const enforceMergeGate = body.enforceMergeGate === true;
    const contract =
      body.contract && typeof body.contract === "object" && !Array.isArray(body.contract)
        ? (body.contract as Record<string, unknown>)
        : undefined;

    if (!repositoryId || !Number.isInteger(pullRequestNumber) || pullRequestNumber <= 0 || !checks) {
      return apiError("repositoryId, pullRequestNumber, and checks are required", {
        status: 400,
        requestId,
        code: "MISSING_FIELDS",
      });
    }

    const repository = await getRepositoryById(repositoryId, userId);
    if (!repository) {
      return apiError("Unknown repositoryId", {
        status: 404,
        requestId,
        code: "REPOSITORY_NOT_FOUND",
      });
    }

    for (const [checkName, value] of Object.entries(checks)) {
      if (value !== "success" && value !== "failed" && value !== "pending") {
        return apiError(`Invalid check status for ${checkName}`, {
          status: 400,
          requestId,
          code: "INVALID_STATUS",
        });
      }
      setGitHubCheckStatus(repositoryId, checkName, value);
    }

    const contractErrors = toContractIssues(contract?.errors);
    const contractWarnings = toContractIssues(contract?.warnings);
    const contractType =
      typeof contract?.type === "string" && contract.type.trim()
        ? contract.type.trim()
        : "unspecified";
    const explicitContractStatus = contract?.status;
    let contractStatus: Status | undefined;
    if (explicitContractStatus === "success" || explicitContractStatus === "failed" || explicitContractStatus === "pending") {
      contractStatus = explicitContractStatus;
    } else if (contract) {
      contractStatus = contractErrors.length > 0 ? "failed" : "success";
    }
    if (contractStatus) {
      setGitHubCheckStatus(repositoryId, "agentmd/output-contract", contractStatus);
      recordContractValidationResult({ contractType, status: contractStatus });
    }

    const gate = listGitHubGates().find((item) => item.repositoryId === repositoryId);
    const requiredChecks = gate?.requiredChecks ?? [];
    const gateDecision = gate
      ? evaluateGitHubGate(gate)
      : {
          pass: false,
          missingChecks: [],
          failedChecks: [],
          pendingChecks: [],
          blockedReasons: ["No gate configured for repository."],
        };
    const gatePass = gateDecision.pass;
    const summary = buildSummary({
      repositoryName: repository.fullName,
      pullRequestNumber,
      requiredChecks,
      checks: gate?.checks ?? {},
      gateDecision,
      contractErrors,
    });

    const eventsToEmit: IntegrationEventPayload[] = [];
    if (contractStatus === "failed" || contractErrors.length > 0) {
      eventsToEmit.push({
        type: "contract.failed",
        repositoryId,
        repositoryName: repository.fullName,
        pullRequestNumber,
        occurredAt: new Date().toISOString(),
        details: { errors: contractErrors, warnings: contractWarnings },
      });
    }
    for (const issue of contractErrors) {
      if (issue.code === "OUTPUT_QUALITY_GATE_FAILED") {
        eventsToEmit.push({
          type: "quality_gate.failed",
          repositoryId,
          repositoryName: repository.fullName,
          pullRequestNumber,
          occurredAt: new Date().toISOString(),
          details: { gate: parseDetailAfterColon(issue.message), message: issue.message },
        });
      }
      if (issue.code === "OUTPUT_ARTIFACT_MISSING") {
        eventsToEmit.push({
          type: "artifacts.missing",
          repositoryId,
          repositoryName: repository.fullName,
          pullRequestNumber,
          occurredAt: new Date().toISOString(),
          details: { artifact: parseDetailAfterColon(issue.message), message: issue.message },
        });
      }
      if (issue.code === "OUTPUT_EXIT_CRITERIA_UNMET") {
        eventsToEmit.push({
          type: "exit_criteria.unmet",
          repositoryId,
          repositoryName: repository.fullName,
          pullRequestNumber,
          occurredAt: new Date().toISOString(),
          details: { criterion: parseDetailAfterColon(issue.message), message: issue.message },
        });
      }
    }

    const emittedEvents = [];
    for (const event of eventsToEmit) {
      const result = await emitIntegrationEvent(event);
      emittedEvents.push({ type: event.type, ...result });
    }

    let comment = { attempted: false, posted: false, reason: "postComment disabled" };
    if (postComment) {
      const token = process.env.GITHUB_TOKEN?.trim();
      if (!token) {
        comment = { attempted: true, posted: false, reason: "GITHUB_TOKEN missing" };
      } else {
        const [owner, repoName] = repository.fullName.split("/");
        try {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/issues/${pullRequestNumber}/comments`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/vnd.github+json",
                "User-Agent": "agentmd-dashboard",
              },
              body: JSON.stringify({ body: summary }),
            }
          );
          if (!response.ok) {
            comment = { attempted: true, posted: false, reason: `GitHub API ${response.status}` };
          } else {
            comment = { attempted: true, posted: true, reason: "posted" };
            recordGitHubPrCommentPosted();
          }
        } catch {
          comment = { attempted: true, posted: false, reason: "GitHub API request failed" };
        }
      }
    }

    const payload = {
      repositoryId,
      pullRequestNumber,
      gatePass,
      gateDecision,
      summary,
      comment,
      contract: {
        type: contractType,
        status: contractStatus ?? "not_provided",
        errors: contractErrors,
        warnings: contractWarnings,
      },
      events: emittedEvents,
    };

    if (enforceMergeGate && !gatePass) {
      return apiError("Merge blocked by required checks", {
        status: 409,
        requestId,
        code: "MERGE_BLOCKED",
        details: payload,
      });
    }

    return apiOk(payload, { requestId });
  } catch {
    return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
  }
}
