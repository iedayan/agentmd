import { apiOk, getRequestId } from '@/lib/core/api-response';
import { listAuditLogs } from '@/lib/data/dashboard-data-facade';
import { requireSessionUserId } from '@/lib/auth/session';
import type { AuditEntry } from '@/lib/ops/mock-data';

export const dynamic = 'force-dynamic';

function toResult(action: string): AuditEntry['result'] {
  const normalized = action.toLowerCase();
  if (normalized.includes('reject')) return 'rejected';
  if (normalized.includes('approve')) return 'approved';
  if (normalized.includes('fail') || normalized.includes('block')) return 'fail';
  return 'pass';
}

export async function GET() {
  const requestId = getRequestId();
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const logs = await listAuditLogs(userId, 100);
  const audit = logs.map((log) => ({
    timestamp: new Date(log.timestamp).toISOString().slice(11, 19),
    pipeline: typeof log.details?.repository === 'string' ? log.details.repository : log.resourceId,
    stage: log.resourceType,
    actor: log.userEmail ?? log.userId ?? 'system',
    actorType: log.userEmail ? 'human' : 'agent',
    action: log.action,
    result: toResult(log.action),
    details: typeof log.details === 'object' ? JSON.stringify(log.details) : undefined,
  }));

  return apiOk({ audit }, { requestId });
}
