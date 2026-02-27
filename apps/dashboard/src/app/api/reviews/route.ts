/**
 * Reviews API — submit and list user reviews with star ratings.
 * POST: submit a review (rate-limited)
 * GET: list approved reviews for display
 */
import { NextRequest } from "next/server";
import { getPool, hasDatabase } from "@/lib/data/db";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { rateLimit } from "@/lib/core/rate-limit";
import { getClientKey } from "@/lib/core/request-context";

const MAX_COMMENT_LENGTH = 2000;
const MAX_DISPLAY_NAME_LENGTH = 64;

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const rate = await rateLimit(getClientKey(req), {
    scope: "review-submit",
    maxRequests: 3,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return apiError("Too many reviews. Please try again later.", {
      status: 429,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: "RATE_LIMITED",
    });
  }

  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return apiError("Invalid request payload", {
        status: 400,
        requestId,
        code: "INVALID_PAYLOAD",
      });
    }
    const body = raw as Record<string, unknown>;
    const rating = typeof body.rating === "number" ? body.rating : Number(body.rating);
    const comment =
      typeof body.comment === "string" ? body.comment.trim().slice(0, MAX_COMMENT_LENGTH) : "";
    const displayName =
      typeof body.displayName === "string"
        ? body.displayName.trim().slice(0, MAX_DISPLAY_NAME_LENGTH)
        : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return apiError("Rating must be 1–5", {
        status: 400,
        requestId,
        code: "INVALID_RATING",
      });
    }

    const pool = hasDatabase() ? getPool() : null;
    if (pool) {
      const res = await pool.query(
        `INSERT INTO reviews (rating, comment, display_name, approved)
         VALUES ($1, $2, NULLIF($3, ''), true)
         RETURNING id, rating, comment, display_name, created_at`,
        [rating, comment || null, displayName || null]
      );
      const row = res.rows[0];
      return apiOk(
        {
          ok: true,
          id: row?.id,
          rating,
          createdAt: (row?.created_at as { toISOString?: () => string })?.toISOString?.(),
        },
        { requestId, headers: { "X-RateLimit-Remaining": String(rate.remaining) } }
      );
    }

    // Fallback: no DB — still accept but can't persist. Return success so UX isn't broken.
    return apiOk(
      { ok: true, id: null, rating, createdAt: new Date().toISOString() },
      { requestId, headers: { "X-RateLimit-Remaining": String(rate.remaining) } }
    );
  } catch (err) {
    console.error("Review submit error:", err);
    return apiError("Failed to submit review. Please try again.", {
      status: 500,
      requestId,
      code: "REVIEW_ERROR",
    });
  }
}

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 50);

  const pool = hasDatabase() ? getPool() : null;
  if (!pool) {
    return apiOk({ reviews: [], average: null, count: 0 }, { requestId });
  }

  try {
    const [reviewsRes, statsRes] = await Promise.all([
      pool.query(
        `SELECT id, rating, comment, display_name, created_at
         FROM reviews
         WHERE approved = true
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      ),
      pool.query(
        `SELECT AVG(rating)::numeric(3,2) as avg, COUNT(*)::int as cnt
         FROM reviews
         WHERE approved = true`
      ),
    ]);

    const reviews = reviewsRes.rows.map((row) => ({
      id: row.id,
      rating: Number(row.rating),
      comment: row.comment ?? undefined,
      displayName: row.display_name ?? undefined,
      createdAt: (row.created_at as { toISOString?: () => string })?.toISOString?.() ?? "",
    }));

    const stats = statsRes.rows[0];
    const average = stats?.avg != null ? Number(stats.avg) : null;
    const count = stats?.cnt != null ? Number(stats.cnt) : 0;

    return apiOk({ reviews, average, count }, { requestId });
  } catch (err) {
    console.error("Reviews fetch error:", err);
    return apiOk({ reviews: [], average: null, count: 0 }, { requestId });
  }
}
