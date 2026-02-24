import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { evaluateExecutionPreflight } from "@/lib/analytics/governance-data";
import type { TriggerType } from "@/types";

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
    }
    const body = raw as Record<string, unknown>;
    const repositoryId =
      typeof body.repositoryId === "string" ? body.repositoryId.trim() : undefined;
    const repositoryName =
      typeof body.repositoryName === "string" ? body.repositoryName.trim() : undefined;
    const requestedBy =
      typeof body.requestedBy === "string" ? body.requestedBy.trim() : "api_user";
    const agentId = typeof body.agentId === "string" ? body.agentId.trim() : undefined;
    const agentsMdUrl =
      typeof body.agentsMdUrl === "string" ? body.agentsMdUrl.trim() : undefined;
    const trigger =
      body.trigger === "manual" ||
      body.trigger === "push" ||
      body.trigger === "pull_request" ||
      body.trigger === "schedule"
        ? (body.trigger as TriggerType)
        : "manual";

    const decision = evaluateExecutionPreflight({
      repositoryId,
      repositoryName,
      requestedBy,
      agentId,
      agentsMdUrl,
      trigger,
    });

    if (!decision.allowed) {
      return apiError(decision.reason, {
        status: decision.code === "APPROVAL_REQUIRED" ? 409 : 403,
        requestId,
        code: decision.code,
        details: decision.approvalId ? { approvalId: decision.approvalId } : undefined,
      });
    }
    return apiOk({ allowed: true }, { requestId });
  } catch {
    return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
  }
}
