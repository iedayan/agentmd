import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '../route';

describe('GET /api/billing/status', () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRO_PRICE_ID;
    delete process.env.STRIPE_ENTERPRISE_PRICE_ID;
  });

  it('returns configured: false when Stripe env vars are missing', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.configured).toBe(false);
  });

  it('returns configured: false when only STRIPE_SECRET_KEY is set', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.configured).toBe(false);
  });

  it('returns configured: true when all required Stripe vars are set', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.configured).toBe(true);
  });

  it('returns configured: false when vars are whitespace-only', async () => {
    process.env.STRIPE_SECRET_KEY = '   ';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_ent';
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.configured).toBe(false);
  });
});
