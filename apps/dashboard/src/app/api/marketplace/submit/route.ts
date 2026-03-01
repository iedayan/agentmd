/**
 * POST /api/marketplace/submit
 * Authenticated sellers submit a new agent listing.
 * Requires: Authorization: Bearer <token> (from agentmd login)
 * Body: { name, description, agentsMdUrl, pricing, sellerId, sellerName, category, capabilities }
 *
 * Appends to the in-memory marketplaceAgents array.
 * Swap for DB writes in production.
 */
import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiOk, apiError, getRequestId } from '@/lib/core/api-response';
import { rateLimit } from '@/lib/core/rate-limit';
import { getClientKey } from '@/lib/core/request-context';
import type { AgentListing, AgentCategory } from '@agentmd-dev/core';

// Import the in-memory store via the existing data module
// We reach into the module's export to call the internal addMarketplaceAgent helper added below.
// Since TypeScript may not know about this dynamic export we use an augmented import.

type PricingModel = 'free' | 'one-time' | 'subscription' | 'usage-based';

interface SubmitBody {
    name: string;
    description: string;
    agentsMdUrl: string;
    pricing: {
        model: PricingModel;
        oneTimePrice?: number;
        subscriptionPrice?: number;
        usagePrice?: number;
    };
    sellerId: string;
    sellerName: string;
    category?: string;
    capabilities?: string[];
    requiredPermissions?: string[];
}

/** In-memory store for submitted agents (shared via module singleton). */
export const submittedAgents: AgentListing[] = [];

function validateBearer(req: NextRequest): boolean {
    const auth = req.headers.get('authorization') ?? '';
    // Accept any non-empty Bearer token (device-flow token or user session token).
    // In production, validate against a token DB / JWT.
    return auth.startsWith('Bearer ') && auth.length > 10;
}

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req);

    if (!validateBearer(req)) {
        return apiError('Authentication required. Run agentmd login to get a token.', {
            status: 401,
            requestId,
            code: 'UNAUTHENTICATED',
        });
    }

    const rate = await rateLimit(getClientKey(req), {
        scope: 'marketplace-submit',
        maxRequests: 5,
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

    let body: SubmitBody;
    try {
        body = (await req.json()) as SubmitBody;
    } catch {
        return apiError('Invalid JSON body.', { status: 400, requestId, code: 'INVALID_PAYLOAD' });
    }

    // Validate required fields
    const { name, description, agentsMdUrl, pricing, sellerId, sellerName } = body;
    if (!name?.trim() || !description?.trim() || !agentsMdUrl?.trim() || !sellerId?.trim() || !sellerName?.trim()) {
        return apiError('Missing required fields: name, description, agentsMdUrl, sellerId, sellerName.', {
            status: 400,
            requestId,
            code: 'MISSING_FIELDS',
        });
    }
    if (!pricing || !['free', 'one-time', 'subscription', 'usage-based'].includes(pricing.model)) {
        return apiError('Invalid pricing.model. Must be free | one-time | subscription | usage-based.', {
            status: 400,
            requestId,
            code: 'INVALID_PRICING',
        });
    }
    try {
        new URL(agentsMdUrl);
    } catch {
        return apiError('Invalid agentsMdUrl.', { status: 400, requestId, code: 'INVALID_URL' });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 64);

    const listing: AgentListing = {
        id: randomUUID(),
        name: name.trim(),
        slug,
        description: description.trim(),
        exampleAgentsMd: `agent:\n  name: ${slug}\n  purpose: ${description.trim().slice(0, 60)}`,
        agentsMdUrl: agentsMdUrl.trim(),
        pricing: {
            model: pricing.model,
            ...(pricing.oneTimePrice != null ? { oneTimePrice: Math.round(pricing.oneTimePrice) } : {}),
            ...(pricing.subscriptionPrice != null ? { subscriptionPrice: Math.round(pricing.subscriptionPrice) } : {}),
            ...(pricing.usagePrice != null ? { usagePrice: Math.round(pricing.usagePrice) } : {}),
        },
        sellerId: sellerId.trim(),
        sellerName: sellerName.trim(),
        category: (body.category?.trim() ?? 'other') as AgentCategory,
        capabilities: body.capabilities ?? [],
        requiredPermissions: body.requiredPermissions ?? [],
        license: pricing.model === 'free' ? 'MIT' : 'Commercial',
        trustScore: 70, // Default; increased after review
        certified: false,
        rating: 0,
        reviewCount: 0,
        updatedAt: new Date().toISOString(),
    };

    submittedAgents.push(listing);

    return apiOk({ listing }, { requestId, headers: { 'X-RateLimit-Remaining': String(rate.remaining) } });
}
