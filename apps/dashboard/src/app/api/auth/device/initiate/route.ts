/**
 * POST /api/auth/device/initiate
 * CLI calls this to start the device code login flow.
 * Returns { deviceCode, userCode, verificationUrl }
 */
import { NextRequest } from 'next/server';
import { apiOk, apiError, getRequestId } from '@/lib/core/api-response';
import { rateLimit } from '@/lib/core/rate-limit';
import { getClientKey } from '@/lib/core/request-context';
import { getPublicAppUrl } from '@/lib/core/public-url';
import { createDeviceCode } from '@/lib/auth/device-codes';

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req);
    const rate = await rateLimit(getClientKey(req), {
        scope: 'device-initiate',
        maxRequests: 10,
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

    const { deviceCode, userCode } = createDeviceCode();
    const appUrl = getPublicAppUrl(req.nextUrl.origin);

    return apiOk(
        {
            deviceCode,
            userCode,
            verificationUrl: `${appUrl}/auth/device?code=${encodeURIComponent(userCode)}`,
            expiresInSeconds: 600,
        },
        { requestId, headers: { 'X-RateLimit-Remaining': String(rate.remaining) } },
    );
}
