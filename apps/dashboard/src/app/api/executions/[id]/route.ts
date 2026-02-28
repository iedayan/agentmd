import { getExecutionById, listExecutionSteps } from '@/lib/data/dashboard-data-facade';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { requireSessionUserId } from '@/lib/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  const [execution, steps] = await Promise.all([
    getExecutionById(id, userId),
    listExecutionSteps(id, userId),
  ]);
  if (!execution) {
    return apiError('Execution not found', { status: 404, requestId });
  }

  return apiOk(
    {
      id: execution.id,
      execution,
      steps,
    },
    { requestId },
  );
}
