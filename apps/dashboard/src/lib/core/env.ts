/**
 * Environment variable validation.
 * Validates required vars when accessed; logs warnings for optional missing vars.
 */
import { z } from 'zod';

const authEnvSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required for auth'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  GITHUB_ID: z.string().min(1, 'GITHUB_ID is required for GitHub OAuth'),
  GITHUB_SECRET: z.string().min(1, 'GITHUB_SECRET is required for GitHub OAuth'),
});

const dbEnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
});

/** Auth env - required for sign-in. Call from auth routes. */
export function getAuthEnv(): z.infer<typeof authEnvSchema> {
  const result = authEnvSchema.safeParse({
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
  });
  if (!result.success) {
    const msg = result.error.errors.map((e) => e.message).join('; ');
    throw new Error(`Auth configuration invalid: ${msg}`);
  }
  return result.data;
}

/** DB env - required in production unless AGENTMD_ALLOW_IN_MEMORY. */
export function getDbEnv(): z.infer<typeof dbEnvSchema> | null {
  if (!process.env.DATABASE_URL?.trim()) return null;
  const result = dbEnvSchema.safeParse({ DATABASE_URL: process.env.DATABASE_URL });
  if (!result.success) {
    console.warn('[env] DATABASE_URL invalid:', result.error.message);
    return null;
  }
  return result.data;
}

/** Check if auth is configured (for conditional UI/routes). */
export function hasAuthEnv(): boolean {
  return !!(
    process.env.NEXTAUTH_SECRET?.trim() &&
    process.env.NEXTAUTH_URL?.trim() &&
    process.env.GITHUB_ID?.trim() &&
    process.env.GITHUB_SECRET?.trim()
  );
}
