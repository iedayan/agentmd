import { NextRequest } from 'next/server';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import {
  assignRole,
  listRoleDefinitions,
  listTeamMembers,
  setOwnership,
} from '@/lib/analytics/governance-data';

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  return apiOk({ roles: listRoleDefinitions(), members: listTeamMembers() }, { requestId });
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return apiError('Invalid payload', { status: 400, requestId, code: 'INVALID_PAYLOAD' });
    }
    const body = raw as Record<string, unknown>;
    const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : '';
    const roleId = typeof body.roleId === 'string' ? body.roleId.trim() : '';
    const ownedRepositoryIds = Array.isArray(body.ownedRepositoryIds)
      ? body.ownedRepositoryIds.filter(
          (value): value is string => typeof value === 'string' && value.trim().length > 0,
        )
      : undefined;

    if (!memberId) {
      return apiError('memberId is required', { status: 400, requestId, code: 'MISSING_MEMBER' });
    }

    let member = null;
    if (roleId) {
      member = assignRole(memberId, roleId);
      if (!member) {
        return apiError('Invalid memberId or roleId', {
          status: 404,
          requestId,
          code: 'NOT_FOUND',
        });
      }
    }
    if (ownedRepositoryIds) {
      member = setOwnership(memberId, ownedRepositoryIds);
      if (!member) {
        return apiError('Invalid memberId', { status: 404, requestId, code: 'NOT_FOUND' });
      }
    }

    if (!member) {
      return apiError('No updates provided', { status: 400, requestId, code: 'NO_UPDATES' });
    }

    return apiOk({ member }, { requestId });
  } catch {
    return apiError('Invalid payload', { status: 400, requestId, code: 'INVALID_PAYLOAD' });
  }
}
