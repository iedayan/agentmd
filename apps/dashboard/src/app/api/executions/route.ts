import { NextRequest } from 'next/server';
import { getDashboardCounts, listExecutions } from '@/lib/data/dashboard-data-facade';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { requireSessionUserId } from '@/lib/auth/session';
import type { Execution } from '@/types';

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const { searchParams } = new URL(req.url);
  const repositoryId = searchParams.get('repositoryId') ?? undefined;
  const statusParam = searchParams.get('status');
  const limitParam = searchParams.get('limit');

  const status = statusParam as Execution['status'] | null;
  if (
    status &&
    status !== 'pending' &&
    status !== 'running' &&
    status !== 'success' &&
    status !== 'failed'
  ) {
    return apiError('Invalid status. Use pending, running, success, or failed.', {
      status: 400,
      requestId,
    });
  }

  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  if (limitParam && (!Number.isInteger(limit) || (limit ?? 0) <= 0)) {
    return apiError('Invalid limit. Use a positive integer.', { status: 400, requestId });
  }

  const [executions, counts] = await Promise.all([
    listExecutions(userId, { repositoryId, status: status ?? undefined, limit }),
    getDashboardCounts(userId),
  ]);

  return apiOk(
    {
      executions,
      meta: {
        total: executions.length,
        executionMinutesUsed: counts.executionMinutesUsed,
        totalCommandsRun: counts.totalCommandsRun,
        totalCommandsFailed: counts.totalCommandsFailed,
      },
    },
    { requestId },
  );
}
