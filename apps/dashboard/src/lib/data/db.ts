/**
 * Postgres connection pool for AgentMD dashboard.
 * Uses Neon serverless driver when DATABASE_URL is set (optimized for Vercel).
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Node.js < 22 needs explicit WebSocket for Neon Pool
if (typeof neonConfig.webSocketConstructor === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

let pool: Pool | null = null;

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }

  return pool;
}

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL?.trim();
}

export function requiresDatabase(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.AGENTMD_ALLOW_IN_MEMORY !== 'true';
}
