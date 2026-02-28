import { describe, it, expect } from 'vitest';
import { validateLicense, isEnterpriseLicensed } from '../enterprise/license.js';

describe('validateLicense', () => {
  it('returns invalid for undefined key', () => {
    const result = validateLicense(undefined);
    expect(result.valid).toBe(false);
    expect(result.features).toEqual([]);
  });

  it('returns invalid for key not starting with AGENTMD-', () => {
    const result = validateLicense('invalid-key');
    expect(result.valid).toBe(false);
  });

  it('returns invalid for malformed key (too few parts)', () => {
    const result = validateLicense('AGENTMD-invalid');
    expect(result.valid).toBe(false);
  });

  it('returns valid for properly formatted key', () => {
    const payload = Buffer.from(
      JSON.stringify({ plan: 'enterprise', exp: Math.floor(Date.now() / 1000) + 86400 }),
    ).toString('base64');
    const key = `AGENTMD-${payload}-sig`;
    const result = validateLicense(key);
    expect(result.valid).toBe(true);
    expect(result.features.length).toBeGreaterThan(0);
    expect(result.features).toContain('self-hosted');
  });

  it('returns invalid for expired key', () => {
    const payload = Buffer.from(
      JSON.stringify({ plan: 'enterprise', exp: Math.floor(Date.now() / 1000) - 3600 }),
    ).toString('base64');
    const key = `AGENTMD-${payload}-sig`;
    const result = validateLicense(key);
    expect(result.valid).toBe(false);
  });

  it('includes maxSeats and organizationId when present', () => {
    const payload = Buffer.from(
      JSON.stringify({
        plan: 'enterprise',
        exp: Math.floor(Date.now() / 1000) + 86400,
        org: 'acme-corp',
        seats: 50,
      }),
    ).toString('base64');
    const key = `AGENTMD-${payload}-sig`;
    const result = validateLicense(key);
    expect(result.valid).toBe(true);
    expect(result.maxSeats).toBe(50);
    expect(result.organizationId).toBe('acme-corp');
  });
});

describe('isEnterpriseLicensed', () => {
  it('returns false for invalid key', () => {
    expect(isEnterpriseLicensed(undefined)).toBe(false);
    expect(isEnterpriseLicensed('bad')).toBe(false);
  });

  it('returns true for valid key', () => {
    const payload = Buffer.from(
      JSON.stringify({ plan: 'enterprise', exp: Math.floor(Date.now() / 1000) + 86400 }),
    ).toString('base64');
    const key = `AGENTMD-${payload}-sig`;
    expect(isEnterpriseLicensed(key)).toBe(true);
  });
});
