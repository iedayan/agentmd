import { randomUUID } from 'crypto';
import { getPool, hasDatabase } from '../data/db';

type TriggerType = 'push' | 'pull_request' | 'schedule' | 'manual';

interface Job {
  id: string;
  userId: string;
  executionId: string;
  repositoryId: string;
  repositoryName: string;
  trigger: TriggerType;
  status: 'queued' | 'running' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface CreateJobInput {
  userId: string;
  executionId: string;
  repositoryId: string;
  repositoryName: string;
  trigger: TriggerType;
  maxAttempts?: number;
}

const jobs = new Map<string, Job>();

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

function rowToJob(row: Record<string, unknown>): Job {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    executionId: String(row.execution_id),
    repositoryId: String(row.repository_id),
    repositoryName: String(row.repository_name),
    trigger: (row.trigger_type as TriggerType) ?? 'manual',
    status: (row.status as Job['status']) ?? 'queued',
    attempts: Number(row.attempts ?? 0),
    maxAttempts: Number(row.max_attempts ?? 3),
    error: typeof row.error === 'string' ? row.error : undefined,
    createdAt: toDate(row.created_at) ?? new Date(),
    startedAt: toDate(row.locked_at),
    completedAt:
      row.status === 'completed' || row.status === 'failed' ? toDate(row.updated_at) : undefined,
  };
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  if (!hasDatabase()) {
    const id = `job_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
    const job: Job = {
      id,
      userId: input.userId,
      executionId: input.executionId,
      repositoryId: input.repositoryId,
      repositoryName: input.repositoryName,
      trigger: input.trigger,
      status: 'queued',
      attempts: 0,
      maxAttempts: input.maxAttempts ?? 3,
      createdAt: new Date(),
    };
    jobs.set(id, job);
    return job;
  }

  const pool = getPool();
  if (!pool) {
    throw new Error('Database not configured');
  }

  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO execution_jobs (
       id, user_id, execution_id, repository_id, repository_name, trigger_type, status, max_attempts
     ) VALUES ($1, $2, $3, $4, $5, $6, 'queued', $7)
     ON CONFLICT (execution_id) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [
      id,
      input.userId,
      input.executionId,
      input.repositoryId,
      input.repositoryName,
      input.trigger,
      input.maxAttempts ?? 3,
    ],
  );
  return rowToJob(res.rows[0]);
}

export async function listJobs(limit = 50, userId?: string): Promise<Job[]> {
  if (!hasDatabase()) {
    return Array.from(jobs.values())
      .filter((job) => (userId ? job.userId === userId : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  const pool = getPool();
  if (!pool) return [];
  const params: unknown[] = [];
  let whereClause = '';
  if (userId) {
    params.push(userId);
    whereClause = `WHERE user_id = $1`;
  }
  params.push(limit);
  const limitIndex = params.length;
  const res = await pool.query(
    `SELECT *
     FROM execution_jobs
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${limitIndex}`,
    params,
  );
  return res.rows.map((row) => rowToJob(row));
}
