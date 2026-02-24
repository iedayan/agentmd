import { NextRequest } from "next/server";
import { apiOk, getRequestId } from "@/lib/core/api-response";
import { listComplianceArtifacts } from "@/lib/analytics/governance-data";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  return apiOk(
    {
      artifacts: listComplianceArtifacts(),
      controls: [
        "Audit logging",
        "Approval trail",
        "RBAC with role assignment history",
        "Policy-as-code snapshots",
      ],
    },
    { requestId }
  );
}
