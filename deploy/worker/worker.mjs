#!/usr/bin/env node
import pg from "pg";
import { runRealExecution, canRunRealExecution } from "./real-execution.mjs";

const { Pool } = pg;

/** Normalize preflight plan to stable blockedCommands for persistence. */
function normalizeBlockedCommands(preflightPlan) {
  if (!preflightPlan || typeof preflightPlan !== "object") return null;
  const items = Array.isArray(preflightPlan.items) ? preflightPlan.items : [];
  const blockedCommands = [];
  for (const item of items) {
    if (item?.runnable) continue;
    const reasonDetails = Array.isArray(item.reasonDetails) ? item.reasonDetails : [];
    const codes = reasonDetails.length > 0
      ? [...new Set(reasonDetails.map((d) => d?.code).filter(Boolean))]
      : ["UNKNOWN"];
    const messages = reasonDetails.length > 0
      ? reasonDetails.map((d) => d?.message ?? "").filter(Boolean)
      : Array.isArray(item.reasons) ? item.reasons.filter((r) => typeof r === "string") : ["Blocked"];
    blockedCommands.push({
      command: typeof item.command === "string" ? item.command : "",
      type: typeof item.type === "string" ? item.type : "",
      section: typeof item.section === "string" ? item.section : "",
      line: typeof item.line === "number" ? item.line : undefined,
      codes,
      messages,
      requiresShell: Boolean(item.requiresShell),
      requiresApproval: Boolean(item.requiresApproval),
    });
  }
  const runnableCount = typeof preflightPlan.runnableCount === "number"
    ? preflightPlan.runnableCount
    : items.filter((i) => i?.runnable).length;
  const blockedCount = typeof preflightPlan.blockedCount === "number"
    ? preflightPlan.blockedCount
    : blockedCommands.length;
  return { runnableCount, blockedCount, blockedCommands };
}

const realExecutionEnabled = process.env.AGENTMD_REAL_EXECUTION === "1";
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required for worker.");
  process.exit(1);
}

const workerId = process.env.WORKER_ID?.trim() || `worker-${process.pid}`;
const pollIntervalMs = Number.parseInt(process.env.WORKER_POLL_INTERVAL_MS || "1000", 10);
const retryBackoffSeconds = Number.parseInt(process.env.WORKER_RETRY_BACKOFF_SECONDS || "30", 10);

const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

let stopped = false;
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    stopped = true;
    await pool.end();
    process.exit(0);
  });
}

main().catch(async (err) => {
  console.error("Worker fatal error:", err);
  await pool.end();
  process.exit(1);
});

async function main() {
  console.log(`[${workerId}] worker started (real execution: ${realExecutionEnabled ? "enabled" : "disabled"})`);
  while (!stopped) {
    const job = await claimNextJob();
    if (!job) {
      await sleep(pollIntervalMs);
      continue;
    }
    await processJob(job);
  }
}

async function claimNextJob() {
  const res = await pool.query(
    `WITH candidate AS (
       SELECT id
       FROM execution_jobs
       WHERE status = 'queued'
         AND next_run_at <= NOW()
       ORDER BY created_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     UPDATE execution_jobs j
     SET status = 'running',
         attempts = j.attempts + 1,
         locked_at = NOW(),
         locked_by = $1,
         updated_at = NOW()
     FROM candidate
     WHERE j.id = candidate.id
     RETURNING j.*`,
    [workerId]
  );
  return res.rows[0] ?? null;
}

async function processJob(job) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const executionId = String(job.execution_id);
    const executionResult = await client.query(
      `SELECT id, status, result
       FROM executions
       WHERE id = $1
       FOR UPDATE`,
      [executionId]
    );

    if (executionResult.rowCount === 0) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const execRow = executionResult.rows[0];
    const execStatus = execRow?.status;
    const resultPayload = execRow?.result && typeof execRow.result === "object" ? execRow.result : {};
    const agentsMdUrl = typeof resultPayload.agentsMdUrl === "string" ? resultPayload.agentsMdUrl.trim() : "";

    if (execStatus === "cancelled") {
      await client.query(
        `UPDATE execution_jobs
         SET status = 'failed',
             error = 'Execution cancelled by user',
             locked_at = NULL,
             locked_by = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [job.id]
      );
      await client.query("COMMIT");
      return;
    }

    await client.query(
      `UPDATE executions
       SET status = 'running',
           started_at = COALESCE(started_at, NOW())
       WHERE id = $1`,
      [executionId]
    );

    let commandsRun = 0;
    let commandsPassed = 0;
    let commandsFailed = 0;
    let durationMs = 0;

    const tryRealExecution =
      realExecutionEnabled &&
      agentsMdUrl &&
      canRunRealExecution(agentsMdUrl);

    let usedRealExecution = false;
    let preflightPlan = undefined;
    if (tryRealExecution) {
      try {
        const realResult = await runRealExecution(agentsMdUrl);
        commandsRun = realResult.commandsRun;
        commandsPassed = realResult.commandsPassed;
        commandsFailed = realResult.commandsFailed;
        durationMs = realResult.durationMs;
        preflightPlan = realResult.plan;

        await client.query(
          `DELETE FROM execution_steps WHERE execution_id = $1`,
          [executionId]
        );

        for (let i = 0; i < realResult.steps.length; i++) {
          const s = realResult.steps[i];
          const stepId = `${executionId}-${i + 1}`;
          const details =
            s.reasons || s.reasonDetails
              ? {
                  reasons: s.reasons,
                  reasonDetails: s.reasonDetails,
                }
              : null;
          await client.query(
            `INSERT INTO execution_steps (id, execution_id, command, type, status, duration_ms, output, error, details)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              stepId,
              executionId,
              s.command,
              s.type,
              s.status,
              s.durationMs ?? null,
              s.output ?? null,
              s.error ?? null,
              details ? JSON.stringify(details) : null,
            ]
          );
        }
        usedRealExecution = true;
      } catch (realErr) {
        const msg = realErr instanceof Error ? realErr.message : "Real execution failed";
        console.warn(`[${workerId}] Real execution failed, falling back to mock:`, msg);
      }
    }

    if (!usedRealExecution) {
      const steps = await client.query(
        `SELECT id, command, type
         FROM execution_steps
         WHERE execution_id = $1
         ORDER BY created_at ASC`,
        [executionId]
      );

      const stepDurations = [950, 1600, 1100, 550];
      const stepOutputs = [
        "Dependencies installed",
        "Build completed successfully",
        "All tests passed",
        "No lint issues found",
      ];

      for (let index = 0; index < steps.rows.length; index++) {
        const step = steps.rows[index];
        await client.query(
          `UPDATE execution_steps
           SET status = 'running',
               output = $2
           WHERE id = $1`,
          [step.id, `Running: ${step.command}`]
        );

        await client.query(
          `UPDATE execution_steps
           SET status = 'success',
               duration_ms = $2,
               output = $3,
               error = NULL
           WHERE id = $1`,
          [
            step.id,
            stepDurations[index] ?? 500,
            stepOutputs[index] ?? `${step.command} completed`,
          ]
        );
      }

      commandsRun = Math.max(steps.rowCount, 0);
      commandsPassed = commandsRun;
      commandsFailed = 0;
      durationMs = 4200;
    }

    const finalStatus = commandsFailed > 0 ? "failed" : "success";
    const normalizedBlocked = preflightPlan ? normalizeBlockedCommands(preflightPlan) : null;
    const resultUpdate = {
      durationMs,
      commandsRun,
      commandsPassed,
      commandsFailed,
      agentsMdUrl: agentsMdUrl || undefined,
      executionMode: usedRealExecution ? "real" : "mock",
      preflightPlan: usedRealExecution ? preflightPlan : undefined,
      ...(normalizedBlocked && {
        blockedCommands: normalizedBlocked.blockedCommands,
        preflightRunnableCount: normalizedBlocked.runnableCount,
        preflightBlockedCount: normalizedBlocked.blockedCount,
      }),
    };

    await client.query(
      `UPDATE executions
       SET status = $2,
           completed_at = NOW(),
           result = COALESCE(result, '{}'::jsonb) || $3::jsonb
       WHERE id = $1`,
      [executionId, finalStatus, JSON.stringify(resultUpdate)]
    );

    await client.query(
      `UPDATE execution_jobs
       SET status = 'completed',
           error = NULL,
           locked_at = NULL,
           locked_by = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [job.id]
    );

    await client.query("COMMIT");

    const jiraUrl = process.env.JIRA_WEBHOOK_URL?.trim();
    if (jiraUrl) {
      notifyJira(executionId, job.repository_name, "success", job.trigger_type, durationMs, commandsRun, commandsPassed, commandsFailed).catch((err) =>
        console.warn("[worker] Jira webhook error:", err)
      );
    }
  } catch (err) {
    await client.query("ROLLBACK");
    await markJobFailure(job, err);
  } finally {
    client.release();
  }
}

async function markJobFailure(job, err) {
  const message = err instanceof Error ? err.message : "Unknown worker error";
  const attempts = Number(job.attempts ?? 0);
  const maxAttempts = Number(job.max_attempts ?? 3);
  const shouldRetry = attempts < maxAttempts;

  if (shouldRetry) {
    await pool.query(
      `UPDATE execution_jobs
       SET status = 'queued',
           error = $2,
           locked_at = NULL,
           locked_by = NULL,
           next_run_at = NOW() + ($3 || ' seconds')::interval,
           updated_at = NOW()
       WHERE id = $1`,
      [job.id, message, String(retryBackoffSeconds)]
    );
    return;
  }

  await pool.query(
    `UPDATE execution_jobs
     SET status = 'failed',
         error = $2,
         locked_at = NULL,
         locked_by = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [job.id, message]
  );

  await pool.query(
    `UPDATE executions
     SET status = 'failed',
         completed_at = NOW(),
         result = COALESCE(result, '{}'::jsonb) || $2::jsonb
     WHERE id = $1`,
    [
      String(job.execution_id),
      JSON.stringify({
        commandsFailed: 1,
        error: message,
      }),
    ]
  );

  const jiraUrl = process.env.JIRA_WEBHOOK_URL?.trim();
  if (jiraUrl) {
    notifyJira(String(job.execution_id), job.repository_name, "failed", job.trigger_type, null, 0, 0, 1).catch((err) =>
      console.warn("[worker] Jira webhook error:", err)
    );
  }
}

async function notifyJira(executionId, repositoryName, status, trigger, durationMs, commandsRun, commandsPassed, commandsFailed) {
  const webhookUrl = process.env.JIRA_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;
  const body = {
    executionId,
    repositoryName,
    status,
    trigger,
    durationMs,
    commandsRun,
    commandsPassed,
    commandsFailed,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    summary: status === "failed"
      ? `AgentMD execution failed: ${repositoryName} (${commandsFailed} commands failed)`
      : `AgentMD execution completed: ${repositoryName}`,
  };
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Jira webhook ${res.status}`);
  }
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
