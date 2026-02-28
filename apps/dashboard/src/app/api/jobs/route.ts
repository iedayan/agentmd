import { NextRequest } from 'next/server';
import { createJob, listJobs } from '@/lib/core/job-queue';
import { addAuditLog, getRepositoryById } from '@/lib/data/dashboard-data-facade';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { rateLimit } from '@/lib/core/rate-limit';
import { getClientKey } from '@/lib/core/request-context';
import { requireSessionUserId } from '@/lib/auth/session';
import type { TriggerType } from '@/types';

export async function GET() {
  const jobs = await listJobs();
  return apiOk({ jobs });
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
    scope: 'jobs:create',
    maxRequests: 20,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return apiError('Rate limit exceeded. Try again in a minute.', {
      status: 429,
      requestId,
      headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      code: 'RATE_LIMITED',
    });
  }

  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return apiError('Invalid request payload', {
        status: 400,
        requestId,
        headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
        code: 'INVALID_PAYLOAD',
      });
    }

    const body = raw as Record<string, unknown>;
    const repositoryId =
      typeof body.repositoryId === 'string' ? body.repositoryId.trim() : undefined;
    const repositoryName =
      typeof body.repositoryName === 'string' ? body.repositoryName.trim() : undefined;
    const executionId = typeof body.executionId === 'string' ? body.executionId.trim() : undefined;
    const trigger = body.trigger as TriggerType | undefined;

    if (repositoryName && repositoryName.length > 200) {
      return apiError('repositoryName is too long', {
        status: 400,
        requestId,
        code: 'REPOSITORY_NAME_TOO_LONG',
      });
    }

    const resolvedTrigger = trigger ?? 'manual';
    if (
      resolvedTrigger !== 'manual' &&
      resolvedTrigger !== 'push' &&
      resolvedTrigger !== 'pull_request' &&
      resolvedTrigger !== 'schedule'
    ) {
      return apiError('Invalid trigger. Use manual, push, pull_request, or schedule.', {
        status: 400,
        requestId,
        code: 'INVALID_TRIGGER',
      });
    }

    const repository = repositoryId ? await getRepositoryById(repositoryId, userId) : undefined;
    if (repositoryId && !repository) {
      return apiError('Unknown repositoryId', {
        status: 404,
        requestId,
        code: 'REPOSITORY_NOT_FOUND',
      });
    }

    const job = await createJob({
      userId,
      executionId: executionId || `manual-${Date.now()}`,
      repositoryId: repository?.id ?? repositoryId ?? 'external',
      repositoryName: repository?.fullName ?? repositoryName ?? 'external/agent',
      trigger: resolvedTrigger,
    });

    await addAuditLog({
      userId,
      action: 'job.created',
      resourceType: 'job',
      resourceId: job.id,
      details: {
        repositoryId: job.repositoryId,
        trigger: job.trigger,
      },
    });

    return apiOk(
      { job },
      {
        status: 201,
        requestId,
        headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      },
    );
  } catch (err) {
    return apiError('Invalid request payload', {
      status: 400,
      requestId,
      headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      code: 'INVALID_PAYLOAD',
    });
  }
}
