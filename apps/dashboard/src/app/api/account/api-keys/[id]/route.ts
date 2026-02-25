/**
 * Revoke an API key.
 */
import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { requireSessionUserId } from "@/lib/auth/session";
import { getPool } from "@/lib/data/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const { id } = await params;
  if (!id) {
    return apiError("Key ID required", { status: 400, requestId });
  }

  const pool = getPool();
  if (!pool) {
    return apiError("Database not configured.", { status: 503, requestId });
  }

  const res = await pool.query(
    `DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  if (res.rowCount === 0) {
    return apiError("API key not found", { status: 404, requestId });
  }

  return apiOk({ ok: true }, { requestId });
}
