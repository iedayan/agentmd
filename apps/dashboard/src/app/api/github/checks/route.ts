import { NextRequest } from 'next/server';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import {
  evaluateGitHubGate,
  listGitHubGates,
  setGitHubCheckStatus,
  setGitHubRequiredChecks,
} from '@/lib/analytics/governance-data';

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  const gates = listGitHubGates().map((gate) => ({
    ...gate,
    decision: evaluateGitHubGate(gate),
  }));
  return apiOk({ gates }, { requestId });
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return apiError('Invalid payload', { status: 400, requestId, code: 'INVALID_PAYLOAD' });
    }
    const body = raw as Record<string, unknown>;
    const repositoryId =
      typeof body.repositoryId === 'string' ? body.repositoryId.trim() : undefined;
    const checkName = typeof body.checkName === 'string' ? body.checkName.trim() : undefined;
    const requiredChecks = Array.isArray(body.requiredChecks)
      ? body.requiredChecks.filter((item): item is string => typeof item === 'string')
      : undefined;
    const status = body.status;
    if (!repositoryId) {
      return apiError('repositoryId is required', {
        status: 400,
        requestId,
        code: 'MISSING_FIELDS',
      });
    }
    if (requiredChecks) {
      const gate = setGitHubRequiredChecks(repositoryId, requiredChecks);
      if (!gate) {
        return apiError('Unknown repositoryId or invalid requiredChecks', {
          status: 404,
          requestId,
          code: 'NOT_FOUND',
        });
      }
      return apiOk({ gate, decision: evaluateGitHubGate(gate) }, { requestId });
    }
    if (!checkName) {
      return apiError('checkName is required when setting status', {
        status: 400,
        requestId,
        code: 'MISSING_FIELDS',
      });
    }
    if (status !== 'success' && status !== 'failed' && status !== 'pending') {
      return apiError('status must be success, failed, or pending', {
        status: 400,
        requestId,
        code: 'INVALID_STATUS',
      });
    }
    const gate = setGitHubCheckStatus(repositoryId, checkName, status);
    if (!gate) {
      return apiError('Unknown repositoryId', { status: 404, requestId, code: 'NOT_FOUND' });
    }
    return apiOk({ gate, decision: evaluateGitHubGate(gate) }, { requestId });
  } catch {
    return apiError('Invalid payload', { status: 400, requestId, code: 'INVALID_PAYLOAD' });
  }
}
