/**
 * Delete the current user's account and all associated data.
 */
import { NextRequest } from 'next/server';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { requireSessionUserId } from '@/lib/auth/session';
import { getPool } from '@/lib/data/db';

export async function DELETE(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const raw = (await req.json()) as unknown;
  const body =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const confirm = body.confirm === true || body.confirm === 'true';

  if (!confirm) {
    return apiError('Confirmation required. Set confirm: true in the request body.', {
      status: 400,
      requestId,
      code: 'CONFIRM_REQUIRED',
    });
  }

  const pool = getPool();
  if (!pool) {
    return apiError('Database not configured.', { status: 503, requestId });
  }

  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    return apiOk({ ok: true }, { requestId });
  } catch (err) {
    console.error('Account delete error:', err);
    return apiError('Failed to delete account', { status: 500, requestId });
  }
}
