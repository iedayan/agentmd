import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { listWorkflowNotifications, markNotificationRead } from "@/lib/analytics/governance-data";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  return apiOk({ notifications: listWorkflowNotifications() }, { requestId });
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
    }
    const id = typeof (raw as { id?: unknown }).id === "string" ? (raw as { id: string }).id : "";
    if (!id) {
      return apiError("id is required", { status: 400, requestId, code: "MISSING_ID" });
    }
    const success = markNotificationRead(id);
    if (!success) {
      return apiError("Notification not found", { status: 404, requestId, code: "NOT_FOUND" });
    }
    return apiOk({ success: true }, { requestId });
  } catch {
    return apiError("Invalid payload", { status: 400, requestId, code: "INVALID_PAYLOAD" });
  }
}
