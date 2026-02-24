import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { decideApprovalRequest, listApprovalRequests } from "@/lib/analytics/governance-data";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  return apiOk({ approvals: listApprovalRequests() }, { requestId });
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
    }
    const body = raw as Record<string, unknown>;
    const approvalId =
      typeof body.approvalId === "string" ? body.approvalId.trim() : undefined;
    const decision =
      body.decision === "approved" || body.decision === "rejected"
        ? body.decision
        : undefined;
    const decidedBy =
      typeof body.decidedBy === "string" && body.decidedBy.trim()
        ? body.decidedBy.trim()
        : "approver_user";
    if (!approvalId || !decision) {
      return apiError("approvalId and decision are required", {
        status: 400,
        requestId,
        code: "MISSING_FIELDS",
      });
    }
    const approval = decideApprovalRequest(approvalId, decision, decidedBy);
    if (!approval) {
      return apiError("Approval not found or already decided", {
        status: 404,
        requestId,
        code: "NOT_FOUND",
      });
    }
    return apiOk({ approval }, { requestId });
  } catch {
    return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
  }
}
