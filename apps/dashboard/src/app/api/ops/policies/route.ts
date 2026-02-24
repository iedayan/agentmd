import { apiOk, getRequestId } from "@/lib/core/api-response";
import { listPolicyRules } from "@/lib/analytics/governance-data";
import { requireSessionUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = getRequestId();
  try {
    await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const policies = listPolicyRules().map((rule) => ({
    id: rule.id,
    description: rule.name,
    enforcement:
      rule.blockPatterns.length > 0
        ? ("block" as const)
        : rule.requireApprovalForPatterns.length > 0
          ? ("require_approval" as const)
          : ("warn" as const),
    scope: "global" as const,
    lastTriggered: "recently",
  }));

  return apiOk(
    { policies },
    { requestId }
  );
}
