import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { listPolicyRules, replacePolicyRules, type PolicyRule } from "@/lib/analytics/governance-data";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  return apiOk({ policies: listPolicyRules() }, { requestId });
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
    }
    const policies = (raw as { policies?: unknown }).policies;
    if (!Array.isArray(policies)) {
      return apiError("policies must be an array", {
        status: 400,
        requestId,
        code: "INVALID_POLICIES",
      });
    }
    const normalized: PolicyRule[] = [];
    for (const candidate of policies) {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        return apiError("Each policy must be an object", {
          status: 400,
          requestId,
          code: "INVALID_POLICY",
        });
      }
      const item = candidate as Record<string, unknown>;
      const id = typeof item.id === "string" ? item.id.trim() : "";
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const enabled = item.enabled !== false;
      const requireApprovalForPatterns = Array.isArray(item.requireApprovalForPatterns)
        ? item.requireApprovalForPatterns.filter((value): value is string => typeof value === "string")
        : [];
      const blockPatterns = Array.isArray(item.blockPatterns)
        ? item.blockPatterns.filter((value): value is string => typeof value === "string")
        : [];
      const enforcePrGate = !!item.enforcePrGate;
      if (!id || !name) {
        return apiError("Each policy requires id and name", {
          status: 400,
          requestId,
          code: "INVALID_POLICY_FIELDS",
        });
      }
      normalized.push({
        id,
        name,
        enabled,
        requireApprovalForPatterns,
        blockPatterns,
        enforcePrGate,
      });
    }
    replacePolicyRules(normalized);
    return apiOk({ policies: listPolicyRules() }, { requestId });
  } catch {
    return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
  }
}
