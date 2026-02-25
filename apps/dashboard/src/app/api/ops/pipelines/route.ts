import { apiOk, getRequestId } from "@/lib/core/api-response";
import { listExecutionSteps, listExecutions } from "@/lib/data/dashboard-data-facade";
import { requireSessionUserId } from "@/lib/auth/session";
import type { ExecutionStep } from "@/types";
import type { Pipeline, PipelineStatus } from "@/lib/ops/mock-data";

export const dynamic = "force-dynamic";

function relativeTimestamp(iso: string): string {
  const deltaMs = Date.now() - Date.parse(iso);
  if (!Number.isFinite(deltaMs) || deltaMs < 0) return "just now";
  const minutes = Math.floor(deltaMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function toPipelineStatus(status: string): PipelineStatus {
  if (status === "running" || status === "failed") return status;
  if (status === "success") return "completed";
  return "running";
}

function stageStatusForStep(step: ExecutionStep | undefined): "passed" | "failed" | "pending" | "running" {
  if (!step) return "pending";
  if (step.status === "success") return "passed";
  if (step.status === "failed") return "failed";
  if (step.status === "running") return "running";
  return "pending";
}

async function buildPipelines(userId: string): Promise<Pipeline[]> {
  const executions = await listExecutions(userId, { limit: 50 });
  return Promise.all(executions.map(async (execution) => {
    const steps = await listExecutionSteps(execution.id, userId);
    const install = steps.find((step) => step.type === "install");
    const build = steps.find((step) => step.type === "build");
    const test = steps.find((step) => step.type === "test");
    const lint = steps.find((step) => step.type === "lint");
    const pipelineStatus = toPipelineStatus(execution.status);

    return {
      id: execution.id,
      name: execution.repositoryName,
      sourceRef: `${execution.repositoryName}/AGENTS.md`,
      trigger:
        execution.trigger === "schedule"
          ? "schedule"
          : execution.trigger === "manual" || execution.trigger === "pull_request"
            ? "manual"
            : "push",
      status: pipelineStatus,
      timestamp: relativeTimestamp(execution.startedAt),
      stages: [
        { id: "parse", name: "Parse", status: "passed", duration: "0.1s" },
        { id: "install", name: "Install", status: stageStatusForStep(install) },
        { id: "build", name: "Build", status: stageStatusForStep(build) },
        { id: "test", name: "Test", status: stageStatusForStep(test) },
        { id: "lint", name: "Lint", status: stageStatusForStep(lint) },
        {
          id: "complete",
          name: "Complete",
          status:
            execution.status === "success"
              ? "passed"
              : execution.status === "failed"
                ? "failed"
                : "pending",
        },
      ],
      agentsMdContent: `# Agent Execution\n\nRepository: ${execution.repositoryName}\nTrigger: ${execution.trigger}\n`,
      policyResults: [
        {
          id: `${execution.id}-policy-1`,
          ruleId: "tool-allowlist-enforced",
          description: "Only approved command types are executed",
          passed: execution.commandsFailed === 0,
          enforcement: "block",
        },
      ],
      logLines: steps.map((step) => ({
        timestamp: new Date().toISOString().slice(11, 19),
        stage: step.type,
        message: step.error ?? step.output ?? `${step.command} ${step.status}`,
        stageColor: step.status === "failed" ? "#dc2626" : "#2563eb",
      })),
    };
  }));
}

export async function GET() {
  const requestId = getRequestId();
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const pipelines = await buildPipelines(userId);
  return apiOk(
    { pipelines },
    { requestId }
  );
}
