import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

const mockCreate = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  requireSessionUserId: vi.fn().mockResolvedValue('user-123'),
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { email: 'test@example.com' } }),
}));

vi.mock('@/lib/core/public-url', () => ({
  getPublicAppUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      checkout: {
        sessions: {
          create: mockCreate,
        },
      },
    };
  }),
}));

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3001/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRO_PRICE_ID;
    delete process.env.STRIPE_ENTERPRISE_PRICE_ID;
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/test-session' });
  });

  it('returns 503 when STRIPE_SECRET_KEY is not set', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';

    const res = await POST(createRequest({ planId: 'pro' }));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.code).toBe('BILLING_NOT_CONFIGURED');
    expect(json.error).toContain('Billing is not configured');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 503 when STRIPE_PRO_PRICE_ID is not set for pro plan', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    delete process.env.STRIPE_PRO_PRICE_ID;
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';

    const res = await POST(createRequest({ planId: 'pro' }));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('BILLING_NOT_CONFIGURED');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 503 when STRIPE_ENTERPRISE_PRICE_ID is not set for enterprise plan', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    delete process.env.STRIPE_ENTERPRISE_PRICE_ID;

    const res = await POST(createRequest({ planId: 'enterprise' }));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('BILLING_NOT_CONFIGURED');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when payload is invalid', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';

    const res = await POST(createRequest(null));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_PAYLOAD');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when planId is missing', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';

    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_PLAN_ID');
    expect(json.error).toContain('pro');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when planId is invalid', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';

    const res = await POST(createRequest({ planId: 'free' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_PLAN_ID');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates checkout session for pro plan and returns checkout URL', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro_123';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent_456';

    const res = await POST(createRequest({ planId: 'pro' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.url).toBe('https://checkout.stripe.com/test-session');

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const call = mockCreate.mock.calls[0][0];
    expect(call.mode).toBe('subscription');
    expect(call.line_items).toEqual([{ price: 'price_pro_123', quantity: 1 }]);
    expect(call.subscription_data).toEqual({ trial_period_days: 7 });
    expect(call.metadata).toMatchObject({ planId: 'pro', trialDays: '7' });
  });

  it('creates checkout session for enterprise plan without trial', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro_123';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent_456';

    const res = await POST(createRequest({ planId: 'enterprise' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.url).toBe('https://checkout.stripe.com/test-session');

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const call = mockCreate.mock.calls[0][0];
    expect(call.line_items).toEqual([{ price: 'price_ent_456', quantity: 1 }]);
    expect(call.subscription_data).toBeUndefined();
    expect(call.metadata).toMatchObject({ planId: 'enterprise', trialDays: '0' });
  });

  it('returns 500 when Stripe API throws', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';
    mockCreate.mockRejectedValueOnce(new Error('Stripe API error'));

    const res = await POST(createRequest({ planId: 'pro' }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.code).toBe('CHECKOUT_SESSION_FAILED');
  });
});
