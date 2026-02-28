import { getPool, hasDatabase } from '../data/db';

const store = new Map<string, { count: number; resetAt: number }>();
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 30;

export interface RateLimitOptions {
  scope?: string;
  windowMs?: number;
  maxRequests?: number;
}

export async function rateLimit(
  key: string,
  options: RateLimitOptions = {},
): Promise<{ allowed: boolean; remaining: number }> {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const scope = options.scope ?? 'default';
  const now = Date.now();

  if (hasDatabase()) {
    const pool = getPool();
    if (pool) {
      try {
        const windowStartMs = Math.floor(now / windowMs) * windowMs;
        const windowStart = new Date(windowStartMs).toISOString();
        const dbKey = key.slice(0, 200);

        const res = await pool.query(
          `INSERT INTO rate_limits (scope, client_key, window_start, count, updated_at)
           VALUES ($1, $2, $3, 1, NOW())
           ON CONFLICT (scope, client_key, window_start)
           DO UPDATE SET count = rate_limits.count + 1, updated_at = NOW()
           RETURNING count`,
          [scope, dbKey, windowStart],
        );

        const count = Number(res.rows[0]?.count ?? 1);
        const remaining = Math.max(0, maxRequests - count);
        return {
          allowed: count <= maxRequests,
          remaining,
        };
      } catch {
        // Fall back to in-memory if DB unavailable (e.g. migrations not run)
      }
    }
  }

  const scopedKey = `${scope}:${key}`;
  const entry = store.get(scopedKey);
  if (!entry) {
    store.set(scopedKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (now > entry.resetAt) {
    store.set(scopedKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  return {
    allowed: entry.count <= maxRequests,
    remaining,
  };
}
