/**
 * Unified data layer facade.
 * Uses Postgres when DATABASE_URL is set, otherwise in-memory.
 * All functions are async and require userId for user-scoped data.
 */
import { hasDatabase } from "./db";
import * as mem from "./dashboard-data";
import * as db from "./dashboard-data-db";
import type { Execution, Repository, TriggerType } from "@/types";
import type { ApiExecutionRecord, AuditLog } from "./dashboard-data";

function shouldUseDb(): boolean {
  if (process.env.NODE_ENV === "production" && !hasDatabase()) {
    throw new Error("DATABASE_URL is required in production. Set AGENTMD_ALLOW_IN_MEMORY=true to override.");
  }
  return hasDatabase();
}

export async function listRepositories(
  userId: string,
  options?: { owner?: string; search?: string }
): Promise<Repository[]> {
  if (shouldUseDb()) {
    return db.listRepositoriesDb(userId, options);
  }
  const repos = mem.listRepositories(options);
  return repos.map((r) => {
    const latest = mem.listExecutions({ repositoryId: r.id, limit: 1 })[0];
    return {
      ...r,
      latestExecutionId: latest?.id,
      latestExecutionStatus: latest?.status,
    };
  });
}

export async function getRepositoryById(id: string, userId: string): Promise<Repository | undefined> {
  if (shouldUseDb()) {
    return db.getRepositoryByIdDb(id, userId);
  }
  return mem.getRepositoryById(id);
}

/** Find repository by full name (e.g. for webhooks - no user context) */
export async function getRepositoryByFullName(fullName: string): Promise<Repository | undefined> {
  if (shouldUseDb()) {
    return db.getRepositoryByFullNameDb(fullName);
  }
  const normalized = fullName.trim().toLowerCase();
  const repo = mem.listRepositories().find((r) => r.fullName.toLowerCase() === normalized);
  return repo;
}

export async function addRepository(
  userId: string,
  input: { name: string; fullName: string; owner: string; healthScore?: number; agentsMdCount?: number }
): Promise<Repository> {
  if (shouldUseDb()) {
    return db.addRepositoryDb(userId, input);
  }
  return mem.addRepository(input);
}

export async function hasRepositoryFullName(userId: string, fullName: string): Promise<boolean> {
  if (shouldUseDb()) {
    return db.hasRepositoryFullNameDb(userId, fullName);
  }
  return mem.hasRepositoryFullName(fullName);
}

export async function listExecutions(
  userId: string,
  options?: { repositoryId?: string; status?: Execution["status"]; limit?: number }
): Promise<Execution[]> {
  if (shouldUseDb()) {
    return db.listExecutionsDb(userId, options);
  }
  return mem.listExecutions(options);
}

export async function getExecutionById(id: string, userId: string): Promise<Execution | undefined> {
  if (shouldUseDb()) {
    return db.getExecutionByIdDb(id, userId);
  }
  return mem.getExecutionById(id);
}

export async function cancelExecution(id: string, userId: string): Promise<Execution | null> {
  if (shouldUseDb()) {
    return db.cancelExecutionDb(id, userId);
  }
  return mem.cancelExecution(id, userId);
}

export async function listExecutionSteps(
  executionId: string,
  userId: string
): Promise<import("@/types").ExecutionStep[]> {
  if (shouldUseDb()) {
    return db.listExecutionStepsDb(executionId, userId);
  }
  return mem.listExecutionSteps(executionId);
}

export async function createQueuedExecution(
  userId: string,
  input: {
    repositoryId?: string;
    repositoryName?: string;
    trigger: TriggerType;
    agentsMdUrl: string;
    idempotencyKey?: string;
  }
): Promise<{
  apiExecution: ApiExecutionRecord;
  dashboardExecution: Execution;
  idempotentReplay: boolean;
}> {
  if (shouldUseDb()) {
    return db.createQueuedExecutionDb(userId, input);
  }
  return mem.createQueuedExecution(input);
}

export async function addAuditLog(
  log: Omit<AuditLog, "id" | "timestamp">
): Promise<AuditLog> {
  if (shouldUseDb()) {
    return db.addAuditLogDb(log);
  }
  return mem.addAuditLog(log);
}

export async function getDashboardCounts(userId: string): Promise<{
  executionMinutesUsed: number;
  totalCommandsRun: number;
  totalCommandsFailed: number;
}> {
  if (shouldUseDb()) {
    return db.getDashboardCountsDb(userId);
  }
  const c = mem.getDashboardCounts();
  return {
    executionMinutesUsed: c.executionMinutesUsed,
    totalCommandsRun: c.totalCommandsRun,
    totalCommandsFailed: c.totalCommandsFailed,
  };
}



export async function upsertGitHubInstallation(
  userId: string,
  installationId: string,
  accountLogin?: string
): Promise<void> {
  if (shouldUseDb()) {
    await db.upsertGitHubInstallation(userId, installationId, accountLogin);
  }
}

export async function getGitHubInstallation(
  userId: string
): Promise<{ installationId: string } | null> {
  if (shouldUseDb()) {
    return db.getGitHubInstallation(userId);
  }
  return null;
}

export function listAuditLogs(userId: string, limit = 100): Promise<AuditLog[]> {
  if (shouldUseDb()) {
    return db.listAuditLogsDb(userId, limit);
  }
  return Promise.resolve(mem.listAuditLogs(limit));
}

export async function getUserSubscriptionPlan(userId: string): Promise<string | null> {
  if (shouldUseDb()) {
    return db.getUserSubscriptionPlanDb(userId);
  }
  return null;
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string }
): Promise<void> {
  if (shouldUseDb()) {
    await db.updateUserProfile(userId, data);
  }
  // In-memory: no-op (users not stored in mem)
}
