/**
 * Kill switch: Cancel a running or pending execution.
 * POST /api/executions/[id]/cancel
 */

import { NextRequest } from 'next/server';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { requireSessionUserId } from '@/lib/auth/session';
import { cancelExecution } from '@/lib/data/dashboard-data-facade';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const { id } = await params;
  if (!id) {
    return apiError('Execution ID required', { status: 400, requestId });
  }

  const result = await cancelExecution(id, userId);
  if (!result) {
    return apiError('Execution not found or not cancellable', {
      status: 404,
      requestId,
      code: 'EXECUTION_NOT_CANCELLABLE',
    });
  }

  return apiOk(
    {
      execution: result,
      message: 'Execution cancelled.',
    },
    { requestId },
  );
}
