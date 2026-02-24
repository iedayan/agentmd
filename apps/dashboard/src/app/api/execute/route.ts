/**
 * Agent Execution API
 * REST API for agents to discover and execute other agents.
 * Each execution must reference an AGENTS.md file.
 */

import { NextRequest } from "next/server";
import { addAuditLog, createQueuedExecution, getRepositoryById } from "@/lib/data/dashboard-data-facade";
import { apiError, apiOk, getRequestId } from "@/lib/core/api-response";
import { createJob } from "@/lib/core/job-queue";
import { rateLimit } from "@/lib/core/rate-limit";
import { getClientKey } from "@/lib/core/request-context";
import { evaluateExecutionPreflight } from "@/lib/analytics/governance-data";
import { requireSessionUserId } from "@/lib/auth/session";
import type { TriggerType } from "@/types";

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
    const agentsMdUrl =
      typeof body.agentsMdUrl === "string" ? body.agentsMdUrl.trim() : undefined;
    const agentId = typeof body.agentId === "string" ? body.agentId.trim() : undefined;
    const repositoryId =
      typeof body.repositoryId === "string" ? body.repositoryId.trim() : undefined;
    const trigger = body.trigger as TriggerType | undefined;

    if (!agentsMdUrl && !agentId) {
      return apiError("agentsMdUrl or agentId required", {
        status: 400,
        requestId,
        code: "MISSING_AGENT_REFERENCE",
      });
    }

    if (agentId && !/^[a-z0-9-]+$/i.test(agentId)) {
      return apiError("Invalid agentId format", {
        status: 400,
        requestId,
        code: "INVALID_AGENT_ID",
      });
    }

    if (agentsMdUrl) {
      try {
        const parsed = new URL(agentsMdUrl);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          return apiError("agentsMdUrl must use http or https", {
            status: 400,
            requestId,
            code: "INVALID_AGENTS_MD_URL_PROTOCOL",
          });
        }
      } catch {
        return apiError("agentsMdUrl must be a valid URL", {
          status: 400,
          requestId,
          code: "INVALID_AGENTS_MD_URL",
        });
      }
    }

    const idempotencyKey = req.headers.get("idempotency-key")?.trim();
    if (idempotencyKey && (idempotencyKey.length < 8 || idempotencyKey.length > 128)) {
      return apiError("idempotency-key must be between 8 and 128 characters", {
        status: 400,
        requestId,
        code: "INVALID_IDEMPOTENCY_KEY",
      });
    }
    if (idempotencyKey && !/^[a-z0-9:_-]+$/i.test(idempotencyKey)) {
      return apiError("idempotency-key contains invalid characters", {
        status: 400,
        requestId,
        code: "INVALID_IDEMPOTENCY_KEY_CHARACTERS",
      });
    }

    const executionTrigger = trigger ?? "manual";
    if (
      executionTrigger !== "manual" &&
      executionTrigger !== "push" &&
      executionTrigger !== "pull_request" &&
      executionTrigger !== "schedule"
    ) {
      return apiError("Invalid trigger. Use manual, push, pull_request, or schedule.", {
        status: 400,
        requestId,
        code: "INVALID_TRIGGER",
      });
    }

    const repository =
      repositoryId ? await getRepositoryById(repositoryId, userId) : undefined;
    if (repositoryId && !repository) {
      return apiError("Unknown repositoryId", {
        status: 404,
        requestId,
        code: "REPOSITORY_NOT_FOUND",
      });
    }

    const preflight = evaluateExecutionPreflight({
      repository: repository ?? undefined,
      repositoryId,
      trigger: executionTrigger,
      requestedBy: userId,
      agentId,
      agentsMdUrl,
    });
    if (!preflight.allowed) {
      return apiError(preflight.reason, {
        status: preflight.code === "APPROVAL_REQUIRED" ? 409 : 403,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
        code: preflight.code,
        details: preflight.approvalId ? { approvalId: preflight.approvalId } : undefined,
      });
    }

    const resolvedAgentsMdUrl =
      agentsMdUrl ?? `https://marketplace.agentmd.io/agents/${agentId}/AGENTS.md`;
    const { apiExecution, dashboardExecution, idempotentReplay } = await createQueuedExecution(userId, {
      repositoryId,
      trigger: executionTrigger,
      agentsMdUrl: resolvedAgentsMdUrl,
      idempotencyKey,
    });

    if (!idempotentReplay) {
      await createJob({
        userId,
        executionId: dashboardExecution.id,
        repositoryId: dashboardExecution.repositoryId,
        repositoryName: dashboardExecution.repositoryName,
        trigger: executionTrigger,
      });
    }

    if (!idempotentReplay) {
      await addAuditLog({
        userId,
        action: "execution.queued",
        resourceType: "execution",
        resourceId: apiExecution.id,
        details: {
          repositoryId: dashboardExecution.repositoryId,
          trigger: executionTrigger,
        },
      });
    }

    return apiOk(
      {
        execution: apiExecution,
        dashboardExecution,
        idempotentReplay,
        message: idempotentReplay
          ? "Existing execution returned for this idempotency key."
          : "Execution queued and will be processed by worker.",
      },
      {
        status: idempotentReplay ? 200 : 201,
        requestId,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      }
    );
  } catch (err) {
    return apiError("Invalid request", {
      status: 400,
      requestId,
      headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      code: "INVALID_REQUEST",
    });
  }
}
