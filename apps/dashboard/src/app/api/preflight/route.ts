import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { parseAndValidate, preflightBodySchema } from "@/lib/core/validate";
import { evaluateExecutionPreflight } from "@/lib/analytics/governance-data";

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const parsed = await parseAndValidate(req, preflightBodySchema, { requestId });
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const decision = evaluateExecutionPreflight({
    repositoryId: body.repositoryId,
    repositoryName: body.repositoryName,
    requestedBy: body.requestedBy ?? "api_user",
    agentId: body.agentId,
    agentsMdUrl: body.agentsMdUrl,
    trigger: body.trigger ?? "manual",
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
}
