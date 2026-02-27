/**
 * Execute API business logic.
 * Extracted from route handler for testability and clarity.
 */
import type { TriggerType } from "@/types";
import type { ApiExecutionRecord } from "@/lib/data/dashboard-data";
import type { Execution } from "@/types";
import {
  addAuditLog,
  createQueuedExecution,
  getRepositoryById,
} from "@/lib/data/dashboard-data-facade";
import { createJob } from "@/lib/core/job-queue";
import { evaluateExecutionPreflight } from "@/lib/analytics/governance-data";

export interface ExecuteInput {
  userId: string;
  agentsMdUrl?: string;
  agentId?: string;
  repositoryId?: string;
  trigger: TriggerType;
  idempotencyKey?: string;
}

export interface ExecuteResult {
  apiExecution: ApiExecutionRecord;
  dashboardExecution: Execution;
  idempotentReplay: boolean;
}

export interface PreflightResult {
  allowed: boolean;
  reason?: string;
  code?: string;
  approvalId?: string;
}

export async function evaluatePreflight(input: {
  userId: string;
  repositoryId?: string;
  agentsMdUrl?: string;
  agentId?: string;
  trigger: TriggerType;
}): Promise<PreflightResult> {
  const repository = input.repositoryId
    ? await getRepositoryById(input.repositoryId, input.userId)
    : undefined;

  if (input.repositoryId && !repository) {
    return { allowed: false, reason: "Unknown repositoryId", code: "REPOSITORY_NOT_FOUND" };
  }

  const preflight = evaluateExecutionPreflight({
    repository: repository ?? undefined,
    repositoryId: input.repositoryId,
    trigger: input.trigger,
    requestedBy: input.userId,
    agentId: input.agentId,
    agentsMdUrl: input.agentsMdUrl,
  });

  if (preflight.allowed) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: preflight.reason,
    code: preflight.code,
    approvalId: preflight.approvalId,
  };
}

export async function queueExecution(input: ExecuteInput): Promise<ExecuteResult> {
  const resolvedAgentsMdUrl =
    input.agentsMdUrl ?? `https://marketplace.agentmd.online/agents/${input.agentId}/AGENTS.md`;

  const { apiExecution, dashboardExecution, idempotentReplay } = await createQueuedExecution(
    input.userId,
    {
      repositoryId: input.repositoryId,
      trigger: input.trigger,
      agentsMdUrl: resolvedAgentsMdUrl,
      idempotencyKey: input.idempotencyKey,
    }
  );

  if (!idempotentReplay) {
    await createJob({
      userId: input.userId,
      executionId: dashboardExecution.id,
      repositoryId: dashboardExecution.repositoryId,
      repositoryName: dashboardExecution.repositoryName,
      trigger: input.trigger,
    });
  }

  if (!idempotentReplay) {
    await addAuditLog({
      userId: input.userId,
      action: "execution.queued",
      resourceType: "execution",
      resourceId: apiExecution.id,
      details: {
        repositoryId: dashboardExecution.repositoryId,
        trigger: input.trigger,
      },
    });
  }

  return {
    apiExecution,
    dashboardExecution,
    idempotentReplay,
  };
}
