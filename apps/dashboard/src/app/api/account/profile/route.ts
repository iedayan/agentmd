import { NextRequest } from 'next/server';
import { requireSessionUserId } from '@/lib/auth/session';
import { updateUserProfile } from '@/lib/data/dashboard-data-facade';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';

export async function PATCH(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return apiError('Invalid request body', {
        status: 400,
        requestId,
        code: 'INVALID_PAYLOAD',
      });
    }

    const body = raw as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const email = typeof body.email === 'string' ? body.email.trim() : undefined;

    if (!name && !email) {
      return apiError('name or email required', {
        status: 400,
        requestId,
        code: 'MISSING_FIELDS',
      });
    }

    if (name && name.length > 200) {
      return apiError('name too long', {
        status: 400,
        requestId,
        code: 'NAME_TOO_LONG',
      });
    }

    if (email && (email.length > 254 || !email.includes('@'))) {
      return apiError('invalid email', {
        status: 400,
        requestId,
        code: 'INVALID_EMAIL',
      });
    }

    await updateUserProfile(userId, { name, email });

    return apiOk({ ok: true }, { requestId });
  } catch {
    return apiError('Failed to update profile', {
      status: 500,
      requestId,
    });
  }
}
