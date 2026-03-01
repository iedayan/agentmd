/**
 * POST /api/auth/device/approve
 * Called by the /auth/device browser page after the user clicks "Approve".
 * Requires a NextAuth session. Generates a CLI API token and marks flow as approved.
 * Body: { userCode: string }
 */
import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { apiOk, apiError, getRequestId } from '@/lib/core/api-response';
import { rateLimit } from '@/lib/core/rate-limit';
import { getClientKey } from '@/lib/core/request-context';
import { findByUserCode, approveDeviceCode } from '@/lib/auth/device-codes';

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req);

    // Must be logged in via NextAuth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
        return apiError('Authentication required.', { status: 401, requestId, code: 'UNAUTHENTICATED' });
    }

    const rate = await rateLimit(getClientKey(req), {
        scope: 'device-approve',
        maxRequests: 10,
        windowMs: 60_000,
    });
    if (!rate.allowed) {
        return apiError('Rate limit exceeded.', {
            status: 429,
            requestId,
            headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
            code: 'RATE_LIMITED',
        });
    }

    let body: Record<string, unknown>;
    try {
        body = (await req.json()) as Record<string, unknown>;
    } catch {
        return apiError('Invalid JSON body.', { status: 400, requestId, code: 'INVALID_PAYLOAD' });
    }

    const userCode = typeof body.userCode === 'string' ? body.userCode.trim().toUpperCase() : '';
    if (!userCode || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(userCode)) {
        return apiError('Invalid user code format. Expected XXXX-YYYY.', {
            status: 400,
            requestId,
            code: 'INVALID_USER_CODE',
        });
    }

    const deviceCode = findByUserCode(userCode);
    if (!deviceCode) {
        return apiError('Code not found or already used. Please run agentmd login again.', {
            status: 404,
            requestId,
            code: 'CODE_NOT_FOUND',
        });
    }

    // Generate a unique API token for this CLI session
    const token = randomUUID();
    const userId = (session.user as { id?: string }).id ?? session.user.email ?? 'unknown';
    const approved = approveDeviceCode(deviceCode, userId, token);

    if (!approved) {
        return apiError('Code expired. Please run agentmd login again.', {
            status: 410,
            requestId,
            code: 'CODE_EXPIRED',
        });
    }

    return apiOk({ message: 'CLI access approved. You can close this page.' }, { requestId });
}
