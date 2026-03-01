/**
 * Stripe Connect — Marketplace seller onboarding.
 * Creates a Stripe Express account (if needed) and returns an Account Link URL
 * for the seller to complete KYC / payout setup.
 *
 * Platform fee: 15% (PLATFORM_FEE_PERCENT) on every marketplace sale.
 *
 * In-memory account map is fine for an MVP; swap for DB in production.
 *
 * POST body: { sellerId?: string, returnUrl?: string, refreshUrl?: string }
 */

import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { getClientKey } from '@/lib/core/request-context';
import { rateLimit } from '@/lib/core/rate-limit';
import { getPublicAppUrl } from '@/lib/core/public-url';

/** In-memory map: sellerId → Stripe Express account ID */
const sellerStripeAccounts = new Map<string, string>();

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

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    return apiError('Stripe Connect is not yet configured. Add STRIPE_SECRET_KEY to enable seller payouts.', {
      status: 503,
      requestId,
      headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      code: 'BILLING_NOT_CONFIGURED',
    });
  }

  let body: Record<string, unknown>;
  try {
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('bad type');
    body = raw as Record<string, unknown>;
  } catch {
    return apiError('Invalid request payload', {
      status: 400,
      requestId,
      headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      code: 'INVALID_PAYLOAD',
    });
  }

  const sellerId = typeof body.sellerId === 'string' ? body.sellerId.trim() : 'anonymous';

  if (!/^[a-z0-9_-]{1,64}$/i.test(sellerId)) {
    return apiError('Invalid sellerId format.', {
      status: 400,
      requestId,
      headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      code: 'INVALID_SELLER_ID',
    });
  }

  const appUrl = getPublicAppUrl(req.nextUrl.origin);
  const returnUrl = (typeof body.returnUrl === 'string' ? body.returnUrl.trim() : null)
    ?? `${appUrl}/dashboard/marketplace/sell?connected=true`;
  const refreshUrl = (typeof body.refreshUrl === 'string' ? body.refreshUrl.trim() : null)
    ?? `${appUrl}/dashboard/marketplace/sell?refresh=true`;

  try {
    const stripe = new Stripe(stripeSecretKey);

    // Reuse existing Stripe account for this seller or create a new Express account
    let stripeAccountId = sellerStripeAccounts.get(sellerId);
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        metadata: { sellerId },
      });
      stripeAccountId = account.id;
      sellerStripeAccounts.set(sellerId, stripeAccountId);
    }

    // Create a one-time onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return apiOk(
      { url: accountLink.url, stripeAccountId, sellerId },
      { requestId, headers: { 'X-RateLimit-Remaining': String(rate.remaining) } },
    );
  } catch (err) {
    console.error('[stripe/connect] Error:', err);
    return apiError('Failed to create Stripe Connect link.', {
      status: 500,
      requestId,
      headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
      code: 'CONNECT_FAILED',
    });
  }
}
