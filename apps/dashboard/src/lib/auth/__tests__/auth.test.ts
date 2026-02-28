import { describe, it, expect } from 'vitest';
import { authOptions } from '../auth';

/**
 * Tests for GitHub authentication configuration.
 * Full OAuth flow requires manual verification (see docs/AUTH_VERIFICATION.md).
 */
describe('GitHub auth configuration', () => {
  it('has GitHub provider configured', () => {
    expect(authOptions.providers).toHaveLength(1);
    const provider = authOptions.providers[0] as { id?: string; name?: string };
    expect(provider.id).toBe('github');
    expect(provider.name).toBe('GitHub');
  });

  it('uses custom sign-in page', () => {
    expect(authOptions.pages?.signIn).toBe('/register');
    expect(authOptions.pages?.error).toBe('/register');
  });

  it('uses JWT strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });

  it('has signIn callback for user provisioning', () => {
    expect(typeof authOptions.callbacks?.signIn).toBe('function');
  });
});
