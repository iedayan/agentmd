import { NextRequest } from "next/server";
import { listAuditLogs } from "@/lib/data/dashboard-data-facade";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { requireSessionUserId } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const limitParam = new URL(req.url).searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 100;
  if (!Number.isInteger(limit) || limit <= 0) {
    return apiError("Invalid limit. Use a positive integer.", { status: 400, requestId });
  }

  const logs = await listAuditLogs(userId, limit);
  return apiOk({ logs }, { requestId });
}
