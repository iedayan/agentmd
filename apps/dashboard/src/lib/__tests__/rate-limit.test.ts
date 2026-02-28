import { describe, it, expect } from 'vitest';
import { rateLimit } from '../core/rate-limit';

describe('rateLimit', () => {
  it('allows first request', async () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    const { allowed, remaining } = await rateLimit(key, {
      scope: 'test',
      maxRequests: 5,
      windowMs: 60_000,
    });
    expect(allowed).toBe(true);
    expect(remaining).toBe(4);
  });

  it('tracks count within window', async () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    await rateLimit(key, { scope: 'test2', maxRequests: 3, windowMs: 60_000 });
    await rateLimit(key, { scope: 'test2', maxRequests: 3, windowMs: 60_000 });
    const { allowed, remaining } = await rateLimit(key, {
      scope: 'test2',
      maxRequests: 3,
      windowMs: 60_000,
    });
    expect(allowed).toBe(true);
    expect(remaining).toBe(0);
  });

  it('blocks when over limit', async () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    await rateLimit(key, { scope: 'test3', maxRequests: 2, windowMs: 60_000 });
    await rateLimit(key, { scope: 'test3', maxRequests: 2, windowMs: 60_000 });
    const { allowed } = await rateLimit(key, {
      scope: 'test3',
      maxRequests: 2,
      windowMs: 60_000,
    });
    expect(allowed).toBe(false);
  });

  it('uses different keys per scope', async () => {
    const key = 'same-key';
    const scope1 = `scope-a-${Date.now()}`;
    const scope2 = `scope-b-${Date.now()}`;
    const r1 = await rateLimit(key, { scope: scope1, maxRequests: 1, windowMs: 60_000 });
    const r2 = await rateLimit(key, { scope: scope2, maxRequests: 1, windowMs: 60_000 });
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });
});
