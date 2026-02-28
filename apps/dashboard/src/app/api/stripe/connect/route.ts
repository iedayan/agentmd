/**
 * Stripe Connect - Marketplace onboarding
 * Sellers connect accounts for payouts
 */

import { NextRequest } from 'next/server';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { getClientKey } from '@/lib/core/request-context';
import { rateLimit } from '@/lib/core/rate-limit';
import { getPublicAppUrl } from '@/lib/core/public-url';

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const rate = await rateLimit(getClientKey(req), {
    scope: 'stripe-connect',
    maxRequests: 20,
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

  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return apiError('Invalid request payload', {
        status: 400,
        requestId,
        headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
        code: 'INVALID_PAYLOAD',
      });
    }
    const body = raw as Record<string, unknown>;
    const sellerId = typeof body.sellerId === 'string' ? body.sellerId.trim() : undefined;
    const returnUrl = typeof body.returnUrl === 'string' ? body.returnUrl.trim() : undefined;
    const refreshUrl = typeof body.refreshUrl === 'string' ? body.refreshUrl.trim() : undefined;

    if (sellerId && !/^[a-z0-9_-]{2,64}$/i.test(sellerId)) {
      return apiError('Invalid sellerId format', {
        status: 400,
        requestId,
        headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
        code: 'INVALID_SELLER_ID',
      });
    }
    for (const value of [returnUrl, refreshUrl]) {
      if (!value) continue;
      try {
        const parsed = new URL(value);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          return apiError('URLs must use http or https', {
            status: 400,
            requestId,
            headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
            code: 'INVALID_URL_PROTOCOL',
          });
        }
      } catch {
        return apiError('Invalid returnUrl or refreshUrl', {
          status: 400,
          requestId,
          headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
          code: 'INVALID_URL',
        });
      }
    }

    const appUrl = getPublicAppUrl(req.nextUrl.origin);

    // In production: stripe.accountLinks.create({ account, return_url, refresh_url })
    return apiOk(
      {
        url: `${appUrl}/dashboard/settings/connect?success=true`,
        message: 'Connect onboarding (Stripe Account Links in production)',
        sellerId: sellerId ?? null,
      },
      {
        requestId,
        headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      },
    );
  } catch {
    return apiError('Invalid request payload', {
      status: 400,
      requestId,
      headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      code: 'INVALID_PAYLOAD',
    });
  }
}
