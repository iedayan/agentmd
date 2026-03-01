/**
 * POST /api/marketplace/purchase
 * Creates a Stripe Checkout Session for a marketplace agent purchase.
 *
 * Applies 15% platform fee via Stripe Connect application_fee_amount (one-time)
 * or application_fee_percent (subscriptions).
 *
 * Falls back gracefully (503) when Stripe is not configured.
 *
 * Body: { agentId: string }
 */
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { apiOk, apiError, getRequestId } from '@/lib/core/api-response';
import { rateLimit } from '@/lib/core/rate-limit';
import { getClientKey } from '@/lib/core/request-context';
import { getPublicAppUrl } from '@/lib/core/public-url';
import { getMarketplaceAgentBySlug, listMarketplaceAgents } from '@/lib/data/dashboard-data';

const PLATFORM_FEE_PERCENT = 15;

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req);

    const rate = await rateLimit(getClientKey(req), {
        scope: 'marketplace-purchase',
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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeSecretKey) {
        return apiError('Billing is not configured yet. Add STRIPE_SECRET_KEY to enable purchases.', {
            status: 503,
            requestId,
            headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
            code: 'BILLING_NOT_CONFIGURED',
        });
    }

    let body: Record<string, unknown>;
    try {
        body = (await req.json()) as Record<string, unknown>;
    } catch {
        return apiError('Invalid JSON body.', { status: 400, requestId, code: 'INVALID_PAYLOAD' });
    }

    const agentId = typeof body.agentId === 'string' ? body.agentId.trim() : '';
    if (!agentId) {
        return apiError('agentId is required.', { status: 400, requestId, code: 'MISSING_AGENT_ID' });
    }

    // Lookup by slug first, then by id scan of all agents (including submitted ones)
    let agent = getMarketplaceAgentBySlug(agentId);
    if (!agent) {
        agent = listMarketplaceAgents().find((a) => a.id === agentId);
    }
    if (!agent) {
        return apiError('Agent not found.', { status: 404, requestId, code: 'AGENT_NOT_FOUND' });
    }
    if (agent.pricing.model === 'free') {
        return apiError('This agent is free — no purchase needed. Install it directly.', {
            status: 400,
            requestId,
            code: 'AGENT_IS_FREE',
        });
    }

    const stripe = new Stripe(stripeSecretKey);
    const appUrl = getPublicAppUrl(req.nextUrl.origin);

    try {
        let session: Stripe.Checkout.Session;

        if (agent.pricing.model === 'one-time' && agent.pricing.oneTimePrice != null) {
            // Price stored in cents already (e.g. 999 = $9.99)
            const price = agent.pricing.oneTimePrice;
            const fee = Math.round(price * (PLATFORM_FEE_PERCENT / 100));

            session = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: agent.name,
                                description: agent.description.slice(0, 255),
                                metadata: { agentId: agent.id, sellerId: agent.sellerId ?? '' },
                            },
                            unit_amount: price,
                        },
                        quantity: 1,
                    },
                ],
                payment_intent_data: {
                    application_fee_amount: fee,
                    // transfer_data: { destination: sellerStripeAccountId } — add when seller is onboarded
                },
                success_url: `${appUrl}/dashboard/marketplace?purchased=${encodeURIComponent(agent.slug)}&success=true`,
                cancel_url: `${appUrl}/dashboard/marketplace?canceled=true`,
                metadata: { agentId: agent.id, sellerId: agent.sellerId ?? '', priceModel: 'one-time' },
            });
        } else if (agent.pricing.model === 'subscription' && agent.pricing.subscriptionPrice != null) {
            const price = agent.pricing.subscriptionPrice;

            session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            recurring: { interval: 'month' },
                            product_data: {
                                name: agent.name,
                                description: agent.description.slice(0, 255),
                            },
                            unit_amount: price,
                        },
                        quantity: 1,
                    },
                ],
                subscription_data: {
                    application_fee_percent: PLATFORM_FEE_PERCENT,
                    // transfer_data: { destination: sellerStripeAccountId } — add when seller is onboarded
                },
                success_url: `${appUrl}/dashboard/marketplace?purchased=${encodeURIComponent(agent.slug)}&success=true`,
                cancel_url: `${appUrl}/dashboard/marketplace?canceled=true`,
                metadata: { agentId: agent.id, sellerId: agent.sellerId ?? '', priceModel: 'subscription' },
            });
        } else {
            // usage-based — send to contact/sales for now
            return apiOk(
                {
                    checkoutUrl: `${appUrl}/contact?agent=${encodeURIComponent(agent.slug)}&inquiry=usage-pricing`,
                    message: 'Usage-based pricing requires a custom quote. Redirecting to contact.',
                },
                { requestId },
            );
        }

        return apiOk(
            { checkoutUrl: session.url },
            { requestId, headers: { 'X-RateLimit-Remaining': String(rate.remaining) } },
        );
    } catch (err) {
        console.error('[marketplace/purchase] Stripe error:', err);
        return apiError('Failed to create checkout session.', {
            status: 500,
            requestId,
            headers: { 'X-RateLimit-Remaining': String(rate.remaining) },
            code: 'CHECKOUT_FAILED',
        });
    }
}
