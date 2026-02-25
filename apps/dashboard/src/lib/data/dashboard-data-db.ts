/**
 * Postgres-backed data layer for AgentMD dashboard.
 * Used when DATABASE_URL is set.
 */
import type { Execution, ExecutionStep, Repository, TriggerType } from "@/types";
import { normalizeBlockedCommands } from "@/lib/execution/blocked-commands";
import type { ApiExecutionRecord, AuditLog } from "./dashboard-data";
import { getPool } from "./db";
import { randomUUID } from "crypto";

function pool() {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  return p;
}

const dbExecutionTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

function toResultMap(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapTriggerType(value: string): TriggerType {
  if (value === "push" || value === "pull_request" || value === "schedule" || value === "manual") {
    return value;
  }
  return "manual";
}

function mapExecutionStatus(value: string): Execution["status"] {
  if (
    value === "pending" ||
    value === "running" ||
    value === "success" ||
    value === "failed" ||
    value === "cancelled"
  ) {
    return value;
  }
  return "pending";
}

function mapExecutionRow(row: Record<string, unknown>): Execution {
  const result = toResultMap(row.result);
  const executionMode = result.executionMode as "real" | "mock" | undefined;
  const agentsMdUrl = typeof result.agentsMdUrl === "string" ? result.agentsMdUrl.trim() : "";
  const preflightPlan = result.preflightPlan;
  const storedBlocked = result.blockedCommands;
  const normalized = Array.isArray(storedBlocked)
    ? {
        blockedCommands: storedBlocked as Execution["blockedCommands"],
        runnableCount: (result.preflightRunnableCount as number) ?? 0,
        blockedCount: (result.preflightBlockedCount as number) ?? storedBlocked.length,
      }
    : normalizeBlockedCommands(preflightPlan);
  return {
    id: String(row.id),
    repositoryId: String(row.repository_id),
    repositoryName: String(row.repository_name),
    trigger: mapTriggerType(String(row.trigger_type)),
    status: mapExecutionStatus(String(row.status)),
    startedAt:
      ((row.started_at as { toISOString?: () => string } | null)?.toISOString?.() ??
        (row.created_at as { toISOString?: () => string } | null)?.toISOString?.() ??
        new Date().toISOString()),
    completedAt: (row.completed_at as { toISOString?: () => string } | null)?.toISOString?.() ?? undefined,
    durationMs: (result.durationMs as number) ?? undefined,
    commandsRun: (result.commandsRun as number) ?? 0,
    commandsPassed: (result.commandsPassed as number) ?? 0,
    commandsFailed: (result.commandsFailed as number) ?? 0,
    executionMode:
      executionMode === "real" || executionMode === "mock" ? executionMode : undefined,
    agentsMdUrl: agentsMdUrl.length > 0 ? agentsMdUrl : undefined,
    preflightPlan:
      preflightPlan && typeof preflightPlan === "object" ? preflightPlan : undefined,
    blockedCommands: normalized?.blockedCommands,
    preflightRunnableCount: normalized?.runnableCount,
    preflightBlockedCount: normalized?.blockedCount,
  };
}

function mapApiExecutionFromRow(
  row: Record<string, unknown>,
  fallbackAgentsMdUrl: string
): ApiExecutionRecord {
  const result = toResultMap(row.result);
  const repositoryId = String(row.repository_id);
  return {
    id: `exec_${String(row.id)}`,
    agentsMdUrl:
      typeof result.agentsMdUrl === "string" && result.agentsMdUrl.trim().length > 0
        ? result.agentsMdUrl
        : fallbackAgentsMdUrl,
    repositoryId: repositoryId === "external" ? null : repositoryId,
    status: "queued",
    createdAt:
      (row.created_at as { toISOString?: () => string } | null)?.toISOString?.() ??
      new Date().toISOString(),
    platformFeePercent: 15,
  };
}

async function markExecutionRunningDb(executionId: string): Promise<void> {
  const p = pool();
  const res = await p.query(
    `UPDATE executions
     SET status = 'running',
         started_at = COALESCE(started_at, NOW())
     WHERE id = $1 AND status = 'pending'`,
    [executionId]
  );
  if (res.rowCount === 0) return;

  await p.query(
    `UPDATE execution_steps
     SET status = 'running',
         output = 'Installing dependencies...'
     WHERE execution_id = $1 AND id = $2`,
    [executionId, `${executionId}-1`]
  );
}

async function markExecutionSucceededDb(executionId: string): Promise<void> {
  const p = pool();
  const resultPayload = {
    durationMs: 4200,
    commandsRun: 4,
    commandsPassed: 4,
    commandsFailed: 0,
  };
  const res = await p.query(
    `UPDATE executions
     SET status = 'success',
         completed_at = NOW(),
         result = result || $2::jsonb
     WHERE id = $1 AND status IN ('pending', 'running')`,
    [executionId, JSON.stringify(resultPayload)]
  );
  if (res.rowCount === 0) return;

  const stepUpdates = [
    { id: `${executionId}-1`, durationMs: 950, output: "Dependencies installed" },
    { id: `${executionId}-2`, durationMs: 1600, output: "Build completed successfully" },
    { id: `${executionId}-3`, durationMs: 1100, output: "All tests passed" },
    { id: `${executionId}-4`, durationMs: 550, output: "No lint issues found" },
  ];

  for (const step of stepUpdates) {
    await p.query(
      `UPDATE execution_steps
       SET status = 'success',
           duration_ms = $2,
           output = $3,
           error = NULL
       WHERE execution_id = $1 AND id = $4`,
      [executionId, step.durationMs, step.output, step.id]
    );
  }
}

function scheduleExecutionLifecycleDb(executionId: string): void {
  const existing = dbExecutionTimers.get(executionId);
  if (existing && existing.length > 0) return;

  const startTimer = setTimeout(() => {
    void markExecutionRunningDb(executionId);
  }, 120);
  const completeTimer = setTimeout(() => {
    void markExecutionSucceededDb(executionId);
    dbExecutionTimers.delete(executionId);
  }, 2200);

  dbExecutionTimers.set(executionId, [startTimer, completeTimer]);
}

export async function ensureUser(userId: string, data?: { email?: string; name?: string; image?: string }) {
  const p = pool();
  await p.query(
    `INSERT INTO users (id, email, name, image, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (id) DO UPDATE SET
       email = COALESCE(EXCLUDED.email, users.email),
       name = COALESCE(EXCLUDED.name, users.name),
       image = COALESCE(EXCLUDED.image, users.image),
       updated_at = NOW()`,
    [userId, data?.email ?? null, data?.name ?? null, data?.image ?? null]
  );
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string }
): Promise<void> {
  const p = pool();
  const updates: string[] = [];
  const values: unknown[] = [userId];
  let idx = 2;
  if (data.name !== undefined) {
    updates.push(`name = $${idx}`);
    values.push(data.name.trim() || null);
    idx++;
  }
  if (data.email !== undefined) {
    updates.push(`email = $${idx}`);
    values.push(data.email.trim() || null);
    idx++;
  }
  if (updates.length === 0) return;
  updates.push("updated_at = NOW()");
  await p.query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $1`,
    values
  );
}

export async function listRepositoriesDb(
  userId: string,
  options?: { owner?: string; search?: string }
): Promise<Repository[]> {
  const p = pool();
  let query = `
    SELECT id, owner, name, full_name, health_score, agents_md_count, last_validated
    FROM repositories WHERE user_id = $1`;
  const params: (string | number)[] = [userId];
  let idx = 2;

  if (options?.owner?.trim()) {
    query += ` AND LOWER(owner) = LOWER($${idx})`;
    params.push(options.owner.trim());
    idx++;
  }
  if (options?.search?.trim()) {
    query += ` AND (LOWER(name) LIKE $${idx} OR LOWER(full_name) LIKE $${idx})`;
    params.push(`%${options.search.trim().toLowerCase()}%`);
    idx++;
  }

  query += ` ORDER BY created_at DESC`;
  const res = await p.query(query, params);
  return res.rows.map((r) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner,
    healthScore: r.health_score ?? 70,
    lastValidated: r.last_validated?.toISOString?.() ?? undefined,
    agentsMdCount: r.agents_md_count ?? 1,
  }));
}

export async function getRepositoryByIdDb(id: string, userId: string): Promise<Repository | undefined> {
  const p = pool();
  const res = await p.query(
    `SELECT id, owner, name, full_name, health_score, agents_md_count, last_validated
     FROM repositories WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  const r = res.rows[0];
  if (!r) return undefined;
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner,
    healthScore: r.health_score ?? 70,
    lastValidated: r.last_validated?.toISOString?.() ?? undefined,
    agentsMdCount: r.agents_md_count ?? 1,
  };
}

export async function addRepositoryDb(
  userId: string,
  input: { name: string; fullName: string; owner: string; healthScore?: number; agentsMdCount?: number }
): Promise<Repository> {
  const p = pool();
  await ensureUser(userId);
  const id = randomUUID();
  await p.query(
    `INSERT INTO repositories (id, user_id, owner, name, full_name, health_score, agents_md_count, last_validated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [
      id,
      userId,
      input.owner,
      input.name,
      input.fullName,
      input.healthScore ?? 70,
      input.agentsMdCount ?? 1,
    ]
  );
  return {
    id,
    name: input.name,
    fullName: input.fullName,
    owner: input.owner,
    healthScore: input.healthScore ?? 70,
    agentsMdCount: input.agentsMdCount ?? 1,
    lastValidated: new Date().toISOString(),
  };
}

export async function getRepositoryByFullNameDb(fullName: string): Promise<Repository | undefined> {
  const p = pool();
  const res = await p.query(
    `SELECT id, owner, name, full_name, health_score, agents_md_count, last_validated
     FROM repositories WHERE LOWER(full_name) = LOWER($1) LIMIT 1`,
    [fullName.trim()]
  );
  const r = res.rows[0];
  if (!r) return undefined;
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner,
    healthScore: r.health_score ?? 70,
    lastValidated: r.last_validated?.toISOString?.() ?? undefined,
    agentsMdCount: r.agents_md_count ?? 1,
  };
}

export async function hasRepositoryFullNameDb(userId: string, fullName: string): Promise<boolean> {
  const p = pool();
  const res = await p.query(
    `SELECT 1 FROM repositories WHERE user_id = $1 AND LOWER(full_name) = LOWER($2) LIMIT 1`,
    [userId, fullName.trim()]
  );
  return res.rows.length > 0;
}

export async function listExecutionsDb(
  userId: string,
  options?: { repositoryId?: string; status?: Execution["status"]; limit?: number }
): Promise<Execution[]> {
  const p = pool();
  let query = `
    SELECT e.id, e.repository_id, e.repository_name, e.trigger_type, e.status,
           e.created_at, e.started_at, e.completed_at, e.result
    FROM executions e
    WHERE e.user_id = $1`;
  const params: (string | number)[] = [userId];
  let idx = 2;

  if (options?.repositoryId) {
    query += ` AND e.repository_id = $${idx}`;
    params.push(options.repositoryId);
    idx++;
  }
  if (options?.status) {
    query += ` AND e.status = $${idx}`;
    params.push(options.status);
    idx++;
  }

  const limit = options?.limit && options.limit > 0 ? options.limit : 100;
  query += ` ORDER BY COALESCE(e.started_at, e.created_at) DESC LIMIT $${idx}`;
  params.push(limit);

  const res = await p.query(query, params);
  return res.rows.map((row) => mapExecutionRow(row));
}

export async function getExecutionByIdDb(id: string, userId: string): Promise<Execution | undefined> {
  const p = pool();
  const res = await p.query(
    `SELECT e.id, e.repository_id, e.repository_name, e.trigger_type, e.status,
            e.created_at, e.started_at, e.completed_at, e.result
     FROM executions e
     WHERE e.id = $1 AND e.user_id = $2`,
    [id, userId]
  );
  const row = res.rows[0];
  if (!row) return undefined;
  return mapExecutionRow(row);
}

export async function cancelExecutionDb(id: string, userId: string): Promise<Execution | null> {
  const p = pool();
  const res = await p.query(
    `UPDATE executions
     SET status = 'cancelled',
         completed_at = COALESCE(completed_at, NOW()),
         result = COALESCE(result, '{}'::jsonb) || $3::jsonb
     WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'running')
     RETURNING *`,
    [id, userId, JSON.stringify({ cancelledAt: new Date().toISOString() })]
  );
  const row = res.rows[0];
  if (!row) return null;
  return mapExecutionRow(row);
}

export async function listExecutionStepsDb(executionId: string, userId: string): Promise<ExecutionStep[]> {
  const exec = await getExecutionByIdDb(executionId, userId);
  if (!exec) return [];

  const p = pool();

  // Backwards compatible with older schemas that don't yet have execution_steps.details.
  const queryWithDetails = async () =>
    p.query(
      `SELECT id, command, type, status, duration_ms, output, error, details
       FROM execution_steps WHERE execution_id = $1 ORDER BY created_at`,
      [executionId]
    );

  const queryWithoutDetails = async () =>
    p.query(
      `SELECT id, command, type, status, duration_ms, output, error
       FROM execution_steps WHERE execution_id = $1 ORDER BY created_at`,
      [executionId]
    );

  let res;
  try {
    res = await queryWithDetails();
  } catch {
    res = await queryWithoutDetails();
  }

  return res.rows.map((r) => {
    const details = toResultMap((r as Record<string, unknown>).details);
    const reasons = Array.isArray(details.reasons)
      ? (details.reasons.filter((v) => typeof v === "string") as string[])
      : undefined;
    const reasonDetails = Array.isArray(details.reasonDetails)
      ? (details.reasonDetails
          .filter((v) => v && typeof v === "object")
          .map((v) => v as { code?: unknown; message?: unknown })
          .filter((v) => typeof v.code === "string" && typeof v.message === "string")
          .map((v) => ({ code: v.code as string, message: v.message as string })) as Array<{
          code: string;
          message: string;
        }>)
      : undefined;

    const status = String(r.status);
    const normalizedStatus: ExecutionStep["status"] =
      status === "pending" ||
      status === "running" ||
      status === "success" ||
      status === "failed" ||
      status === "blocked"
        ? (status as ExecutionStep["status"])
        : "pending";

    return {
      id: r.id,
      command: r.command,
      type: r.type,
      status: normalizedStatus,
      reasons,
      reasonDetails,
      durationMs: r.duration_ms ?? undefined,
      output: r.output ?? undefined,
      error: r.error ?? undefined,
    };
  });
}

export async function createQueuedExecutionDb(
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
  const p = pool();
  const idempotencyKey = input.idempotencyKey?.trim();

  if (idempotencyKey) {
    const existing = await p.query(
      `SELECT id, repository_id, repository_name, trigger_type, status, created_at, started_at, completed_at, result
       FROM executions
       WHERE user_id = $1 AND result->>'idempotencyKey' = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, idempotencyKey]
    );
    const existingRow = existing.rows[0];
    if (existingRow) {
      return {
        apiExecution: mapApiExecutionFromRow(existingRow, input.agentsMdUrl),
        dashboardExecution: mapExecutionRow(existingRow),
        idempotentReplay: true,
      };
    }
  }

  let repositoryName = input.repositoryName ?? "external/agent";
  if (input.repositoryId) {
    const repo = await getRepositoryByIdDb(input.repositoryId, userId);
    if (repo) repositoryName = repo.fullName;
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const resultPayload: Record<string, unknown> = {
    commandsRun: 0,
    commandsPassed: 0,
    commandsFailed: 0,
    agentsMdUrl: input.agentsMdUrl,
  };
  if (idempotencyKey) {
    resultPayload.idempotencyKey = idempotencyKey;
  }

  await p.query(
    `INSERT INTO executions (id, user_id, repository_id, repository_name, trigger_type, status, created_at, started_at, result)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6, $6, $7)`,
    [
      id,
      userId,
      input.repositoryId ?? "external",
      repositoryName,
      input.trigger,
      now,
      JSON.stringify(resultPayload),
    ]
  );

  const defaultSteps = [
    { command: "pnpm install", type: "install", status: "pending" },
    { command: "pnpm run build", type: "build", status: "pending" },
    { command: "pnpm test", type: "test", status: "pending" },
    { command: "pnpm run lint", type: "lint", status: "pending" },
  ];
  for (let i = 0; i < defaultSteps.length; i++) {
    const step = defaultSteps[i];
    await p.query(
      `INSERT INTO execution_steps (id, execution_id, command, type, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [`${id}-${i + 1}`, id, step.command, step.type, step.status]
    );
  }

  const dashboardExecution: Execution = {
    id,
    repositoryId: input.repositoryId ?? "external",
    repositoryName,
    trigger: input.trigger,
    status: "pending",
    startedAt: now,
    commandsRun: 0,
    commandsPassed: 0,
    commandsFailed: 0,
  };

  return {
    apiExecution: {
      id: `exec_${id}`,
      agentsMdUrl: input.agentsMdUrl,
      repositoryId: input.repositoryId ?? null,
      status: "queued",
      createdAt: now,
      platformFeePercent: 15,
    },
    dashboardExecution,
    idempotentReplay: false,
  };
}

export async function getUserSubscriptionPlanDb(userId: string): Promise<string | null> {
  const p = pool();
  const res = await p.query(
    `SELECT plan_id
     FROM user_subscriptions
     WHERE user_id = $1
       AND status IN ('active', 'trialing')
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId]
  );
  const row = res.rows[0];
  return row?.plan_id ?? null;
}

export async function upsertUserSubscriptionPlanDb(input: {
  userId: string;
  planId: string;
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
}): Promise<void> {
  const p = pool();
  await p.query(
    `INSERT INTO user_subscriptions (
       user_id, plan_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       plan_id = EXCLUDED.plan_id,
       status = EXCLUDED.status,
       stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_subscriptions.stripe_customer_id),
       stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, user_subscriptions.stripe_subscription_id),
       current_period_end = COALESCE(EXCLUDED.current_period_end, user_subscriptions.current_period_end),
       updated_at = NOW()`,
    [
      input.userId,
      input.planId,
      input.status,
      input.stripeCustomerId ?? null,
      input.stripeSubscriptionId ?? null,
      input.currentPeriodEnd ?? null,
    ]
  );
}

export async function addAuditLogDb(log: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
  const p = pool();
  const id = randomUUID();
  const timestamp = new Date().toISOString();
  await p.query(
    `INSERT INTO audit_logs (id, user_id, user_email, action, resource_type, resource_id, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      log.userId,
      log.userEmail ?? null,
      log.action,
      log.resourceType,
      log.resourceId,
      log.details ? JSON.stringify(log.details) : null,
    ]
  );
  return { id, timestamp, ...log };
}

export async function getDashboardCountsDb(userId: string): Promise<{
  executionMinutesUsed: number;
  totalCommandsRun: number;
  totalCommandsFailed: number;
}> {
  const p = pool();
  const res = await p.query(
    `SELECT result FROM executions
     WHERE user_id = $1 AND status IN ('success', 'failed')`,
    [userId]
  );
  let totalDurationMs = 0;
  let totalCommandsRun = 0;
  let totalCommandsFailed = 0;
  for (const row of res.rows) {
    const r = (row.result as Record<string, unknown>) ?? {};
    totalDurationMs += (r.durationMs as number) ?? 0;
    totalCommandsRun += (r.commandsRun as number) ?? 0;
    totalCommandsFailed += (r.commandsFailed as number) ?? 0;
  }
  return {
    executionMinutesUsed: Math.round((totalDurationMs / 60000) * 100) / 100,
    totalCommandsRun,
    totalCommandsFailed,
  };
}

export async function upsertGitHubInstallation(
  userId: string,
  installationId: string,
  accountLogin?: string
): Promise<void> {
  const p = pool();
  const id = randomUUID();
  await p.query(
    `INSERT INTO github_installations (id, user_id, installation_id, account_login)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       installation_id = EXCLUDED.installation_id,
       account_login = COALESCE(EXCLUDED.account_login, github_installations.account_login)`,
    [id, userId, installationId, accountLogin ?? null]
  );
}

export async function getGitHubInstallation(userId: string): Promise<{ installationId: string } | null> {
  const p = pool();
  const res = await p.query(
    `SELECT installation_id FROM github_installations WHERE user_id = $1`,
    [userId]
  );
  const row = res.rows[0];
  return row ? { installationId: row.installation_id } : null;
}

export async function listAuditLogsDb(userId: string, limit = 100): Promise<AuditLog[]> {
  const p = pool();
  const res = await p.query(
    `SELECT id, user_id, user_email, action, resource_type, resource_id, details, created_at
     FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map((r) => ({
    id: r.id,
    timestamp: r.created_at?.toISOString?.() ?? new Date().toISOString(),
    userId: r.user_id,
    userEmail: r.user_email ?? undefined,
    action: r.action,
    resourceType: r.resource_type,
    resourceId: r.resource_id,
    details: r.details ?? undefined,
  }));
}
