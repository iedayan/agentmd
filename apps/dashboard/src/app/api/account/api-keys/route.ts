/**
 * List and create API keys for the current user.
 */
import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { createHash } from 'crypto';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { requireSessionUserId } from '@/lib/auth/session';
import { getPool } from '@/lib/data/db';

const PREFIX = 'agentmd_';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const pool = getPool();
  if (!pool) {
    return apiOk({ keys: [] }, { requestId });
  }

  try {
    const res = await pool.query(
      `SELECT id, name, prefix, last_used_at, created_at
       FROM api_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    const keys = res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      prefix: r.prefix,
      lastUsed: r.last_used_at ? formatRelative(r.last_used_at as Date) : 'Never',
      createdAt: (r.created_at as Date).toISOString(),
    }));
    return apiOk({ keys }, { requestId });
  } catch {
    return apiOk({ keys: [] }, { requestId });
  }
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const raw = (await req.json()) as unknown;
  const name =
    raw &&
    typeof raw === 'object' &&
    'name' in raw &&
    typeof (raw as Record<string, unknown>).name === 'string'
      ? ((raw as Record<string, unknown>).name as string).trim()
      : 'API Key';

  const pool = getPool();
  if (!pool) {
    return apiError('Database not configured.', { status: 503, requestId });
  }

  const rawKey = `${PREFIX}${randomBytes(24).toString('hex')}`;
  const keyHash = hashKey(rawKey);
  const id = randomBytes(12).toString('hex');
  const prefix = rawKey.slice(0, 12) + '…';

  try {
    await pool.query(
      `INSERT INTO api_keys (id, user_id, name, prefix, key_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, name.slice(0, 100), prefix, keyHash],
    );
    return apiOk({ id, name, prefix, key: rawKey }, { requestId });
  } catch (err) {
    console.error('API key create error:', err);
    return apiError('Failed to create API key', { status: 500, requestId });
  }
}

function formatRelative(d: Date): string {
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} hours ago`;
  if (diff < 604800_000) return `${Math.floor(diff / 86400_000)} days ago`;
  return d.toLocaleDateString();
}
