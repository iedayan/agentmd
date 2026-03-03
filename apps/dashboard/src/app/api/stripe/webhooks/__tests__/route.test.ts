import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

vi.mock('@/lib/data/dashboard-data-db', () => ({
  upsertUserSubscriptionPlanDb: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/data/db', () => ({
  getPool: vi.fn().mockReturnValue({
    query: vi.fn().mockResolvedValue({ rows: [] }),
  }),
}));

const mockConstructEvent = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      webhooks: {
        constructEvent: mockConstructEvent,
      },
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          status: 'trialing',
          current_period_end: Math.floor(Date.now() / 1000) + 604800,
        }),
      },
    };
  }),
}));

function createRequest(body: string, signature = 'whsec_test'): NextRequest {
  return new NextRequest('http://localhost/api/stripe/webhooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body,
  });
}

describe('POST /api/stripe/webhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';
  });

  it('returns 500 when STRIPE_WEBHOOK_SECRET is not set', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const res = await POST(createRequest('{"type":"checkout.session.completed"}'));
    expect(res.status).toBe(500);
    expect(await res.text()).toContain('Webhook secret not configured');
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const req = new NextRequest('http://localhost/api/stripe/webhooks', {
      method: 'POST',
      body: '{"type":"checkout.session.completed"}',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('Missing stripe-signature');
  });

  it('returns 400 when signature is invalid', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });

    const event = {
      type: 'checkout.session.completed',
      data: { object: {} },
    };
    const res = await POST(createRequest(JSON.stringify(event)));
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('Invalid signature');
  });

  it('returns 200 and processes checkout.session.completed', async () => {
    const session = {
      mode: 'subscription',
      customer: 'cus_xxx',
      subscription: 'sub_xxx',
      metadata: { userId: 'user-123', planId: 'pro' },
    };
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: session },
    });

    const res = await POST(
      createRequest(
        JSON.stringify({ type: 'checkout.session.completed', data: { object: session } }),
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('OK');
  });

  it('returns 200 for unhandled event types', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: { object: {} },
    });

    const res = await POST(createRequest('{"type":"invoice.paid","data":{"object":{}}}'));
    expect(res.status).toBe(200);
  });
});
