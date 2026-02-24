import { NextRequest } from "next/server";
import { addAuditLog, addRepository, hasRepositoryFullName, listRepositories } from "@/lib/data/dashboard-data-facade";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { rateLimit } from "@/lib/core/rate-limit";
import { getClientKey } from "@/lib/core/request-context";
import { requireSessionUserId } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner") ?? undefined;
  const search = searchParams.get("q") ?? undefined;

  const repositories = await listRepositories(userId, { owner, search });
  return apiOk({ repositories }, { requestId });
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const rate = await rateLimit(getClientKey(req), {
    scope: "repositories:create",
    maxRequests: 12,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return apiError("Rate limit exceeded. Try again in a minute.", {
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
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: "INVALID_PAYLOAD",
      });
    }

    const body = raw as Record<string, unknown>;
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : undefined;
    if (!fullName) {
      return apiError("fullName is required", {
        status: 400,
        requestId,
        code: "MISSING_FULL_NAME",
      });
    }
    if (fullName.length > 200) {
      return apiError("fullName is too long", {
        status: 400,
        requestId,
        code: "FULL_NAME_TOO_LONG",
      });
    }

    const parts = fullName.split("/");
    if (parts.length !== 2) {
      return apiError("fullName must be in 'owner/name' format", {
        status: 400,
        requestId,
        code: "INVALID_FULL_NAME_FORMAT",
      });
    }
    const [owner, name] = parts;

    const safePart = /^[a-z0-9._-]+$/i;
    if (!safePart.test(owner) || !safePart.test(name)) {
      return apiError("owner/name contains invalid characters", {
        status: 400,
        requestId,
        code: "INVALID_FULL_NAME_CHARACTERS",
      });
    }

    const healthScore = body.healthScore;
    if (
      healthScore !== undefined &&
      (typeof healthScore !== "number" ||
        !Number.isFinite(healthScore) ||
        healthScore < 0 ||
        healthScore > 100)
    ) {
      return apiError("healthScore must be between 0 and 100", {
        status: 400,
        requestId,
        code: "INVALID_HEALTH_SCORE",
      });
    }

    const agentsMdCount = body.agentsMdCount;
    if (
      agentsMdCount !== undefined &&
      (typeof agentsMdCount !== "number" ||
        !Number.isInteger(agentsMdCount) ||
        agentsMdCount < 0)
    ) {
      return apiError("agentsMdCount must be a non-negative integer", {
        status: 400,
        requestId,
        code: "INVALID_AGENTS_MD_COUNT",
      });
    }

    if (await hasRepositoryFullName(userId, fullName)) {
      return apiError("Repository already connected", {
        status: 409,
        requestId,
        code: "REPOSITORY_EXISTS",
      });
    }

    const repository = await addRepository(userId, {
      owner,
      name,
      fullName,
      healthScore: typeof healthScore === "number" ? healthScore : undefined,
      agentsMdCount: typeof agentsMdCount === "number" ? agentsMdCount : undefined,
    });

    await addAuditLog({
      userId,
      action: "repository.connected",
      resourceType: "repository",
      resourceId: repository.id,
      details: { fullName: repository.fullName },
    });

    return apiOk(
      { repository },
      {
        status: 201,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      }
    );
  } catch {
    return apiError("Invalid request payload", {
      status: 400,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: "INVALID_PAYLOAD",
    });
  }
}
