/**
 * Agent Execution API
 * REST API for agents to discover and execute other agents.
 * Each execution must reference an AGENTS.md file.
 */

import { NextRequest } from "next/server";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { rateLimit } from "@/lib/core/rate-limit";
import { getClientKey } from "@/lib/core/request-context";
import { parseAndValidate, executeBodySchema } from "@/lib/core/validate";
import { requireSessionUserId } from "@/lib/auth/session";
import { evaluatePreflight, queueExecution } from "@/lib/services/execute-service";

const IDEMPOTENCY_KEY_REGEX = /^[a-z0-9:_-]{8,128}$/i;

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const rate = await rateLimit(getClientKey(req), {
    scope: "execute",
    maxRequests: 20,
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

  const parsed = await parseAndValidate(req, executeBodySchema, {
    requestId,
    rateLimitRemaining: String(rate.remaining),
    code: "INVALID_PAYLOAD",
  });
  if (!parsed.ok) return parsed.response;
  const body = parsed.data as {
    agentsMdUrl?: string;
    agentId?: string;
    repositoryId?: string;
    trigger: "manual" | "push" | "pull_request" | "schedule";
  };

  const idempotencyKey = req.headers.get("idempotency-key")?.trim();
  if (idempotencyKey && !IDEMPOTENCY_KEY_REGEX.test(idempotencyKey)) {
    return apiError("idempotency-key must be 8–128 chars, alphanumeric, :, _, -", {
      status: 400,
      requestId,
      code: "INVALID_IDEMPOTENCY_KEY",
    });
  }

  const preflight = await evaluatePreflight({
    userId,
    repositoryId: body.repositoryId,
    agentsMdUrl: body.agentsMdUrl,
    agentId: body.agentId,
    trigger: body.trigger,
  });

  if (!preflight.allowed) {
    return apiError(preflight.reason ?? "Forbidden", {
      status: preflight.code === "APPROVAL_REQUIRED" ? 409 : 403,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: preflight.code,
      details: preflight.approvalId ? { approvalId: preflight.approvalId } : undefined,
    });
  }

  const result = await queueExecution({
    userId,
    agentsMdUrl: body.agentsMdUrl,
    agentId: body.agentId,
    repositoryId: body.repositoryId,
    trigger: body.trigger,
    idempotencyKey: idempotencyKey || undefined,
  });

  return apiOk(
    {
      execution: result.apiExecution,
      dashboardExecution: result.dashboardExecution,
      idempotentReplay: result.idempotentReplay,
      message: result.idempotentReplay
        ? "Existing execution returned for this idempotency key."
        : "Execution queued and will be processed by worker.",
    },
    {
      status: result.idempotentReplay ? 200 : 201,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
    }
  );
}
