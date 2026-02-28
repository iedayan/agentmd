/**
 * Next.js instrumentation - runs when the Node.js server starts.
 * Validates environment and logs configuration status.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const missing: string[] = [];
    const optional: string[] = [];

    if (!process.env.NEXTAUTH_SECRET?.trim()) missing.push('NEXTAUTH_SECRET');
    if (!process.env.NEXTAUTH_URL?.trim()) missing.push('NEXTAUTH_URL');
    if (!process.env.GITHUB_ID?.trim()) missing.push('GITHUB_ID');
    if (!process.env.GITHUB_SECRET?.trim()) missing.push('GITHUB_SECRET');

    if (!process.env.DATABASE_URL?.trim()) {
      if (process.env.NODE_ENV === 'production' && process.env.AGENTMD_ALLOW_IN_MEMORY !== 'true') {
        optional.push('DATABASE_URL (required in production unless AGENTMD_ALLOW_IN_MEMORY)');
      } else {
        optional.push('DATABASE_URL (using in-memory fallback)');
      }
    }

    if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) optional.push('NEXT_PUBLIC_APP_URL');

    if (missing.length > 0) {
      console.warn('[AgentMD] Missing required env:', missing.join(', '));
    }
    if (optional.length > 0) {
      console.info('[AgentMD] Optional env not set:', optional.join('; '));
    }
  }
}
