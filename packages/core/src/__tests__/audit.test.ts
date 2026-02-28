import { describe, it, expect } from 'vitest';
import { maskPii } from '../enterprise/audit.js';

describe('maskPii', () => {
  it('masks email addresses', () => {
    const text = 'Contact user@example.com for support';
    expect(maskPii(text)).toContain('[EMAIL_REDACTED]');
    expect(maskPii(text)).not.toContain('user@example.com');
  });

  it('masks GitHub tokens', () => {
    const text = 'Token: ghp_abcdefghij1234567890';
    expect(maskPii(text)).toContain('[TOKEN_REDACTED]');
    expect(maskPii(text)).not.toContain('ghp_');
  });

  it('masks API keys (sk- prefix)', () => {
    const text = 'Key: sk-abc123xyz';
    expect(maskPii(text)).toContain('[KEY_REDACTED]');
  });

  it('masks long alphanumeric strings (potential secrets)', () => {
    const text = 'Secret: abcdef1234567890abcdef1234567890abcdef123456';
    expect(maskPii(text)).toContain('[REDACTED]');
  });

  it('leaves short strings unchanged', () => {
    const text = 'Normal text with numbers 12345';
    expect(maskPii(text)).toBe(text);
  });
});
