/**
 * GET /api/auth/device/poll?code=<deviceCode>
 * CLI polls this at 3-second intervals to check if the user has approved the login.
 * Returns { status: 'pending' | 'approved' | 'expired', token? }
 */
import { NextRequest } from 'next/server';
import { apiOk, apiError, getRequestId } from '@/lib/core/api-response';
import { rateLimit } from '@/lib/core/rate-limit';
import { getClientKey } from '@/lib/core/request-context';
import { getDeviceCode } from '@/lib/auth/device-codes';

export async function GET(req: NextRequest) {
    const requestId = getRequestId(req);
    const rate = await rateLimit(getClientKey(req), {
        scope: 'device-poll',
        maxRequests: 40,
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

    const code = req.nextUrl.searchParams.get('code')?.trim();
    if (!code || code.length !== 32) {
        return apiError('Missing or invalid device code.', {
            status: 400,
            requestId,
            code: 'INVALID_CODE',
        });
    }

    const entry = getDeviceCode(code);
    if (!entry) {
        return apiError('Device code not found.', { status: 404, requestId, code: 'NOT_FOUND' });
    }

    return apiOk(
        {
            status: entry.status,
            ...(entry.status === 'approved' && entry.token ? { token: entry.token } : {}),
        },
        { requestId, headers: { 'X-RateLimit-Remaining': String(rate.remaining) } },
    );
}
