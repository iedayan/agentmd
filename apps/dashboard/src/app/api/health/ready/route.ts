import { NextRequest } from 'next/server';
import { accessSync, constants, existsSync } from 'fs';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { getGovernanceOperationalStats } from '@/lib/analytics/governance-data';
import { getPool, hasDatabase, requiresDatabase } from '@/lib/data/db';

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  const governance = getGovernanceOperationalStats();
  const checks: Record<string, string> = {};

  const persistenceReady = existsSync(governance.persistedStatePath);
  let persistenceWritable = false;
  if (persistenceReady) {
    try {
      accessSync(governance.persistedStatePath, constants.W_OK);
      persistenceWritable = true;
    } catch {
      persistenceWritable = false;
    }
  }

  if (!persistenceReady) {
    return apiError('Governance persistence not initialized', {
      status: 503,
      requestId,
      code: 'PERSISTENCE_NOT_READY',
      details: { path: governance.persistedStatePath },
    });
  }
  if (!persistenceWritable) {
    return apiError('Governance persistence is not writable', {
      status: 503,
      requestId,
      code: 'PERSISTENCE_NOT_WRITABLE',
      details: { path: governance.persistedStatePath },
    });
  }
  checks.governancePersistence = 'ok';
  checks.governancePersistenceWritable = 'ok';

  if (requiresDatabase() && !hasDatabase()) {
    return apiError('Database is required in production', {
      status: 503,
      requestId,
      code: 'DATABASE_REQUIRED',
      details: { env: 'DATABASE_URL' },
    });
  }

  if (hasDatabase()) {
    try {
      const pool = getPool();
      if (pool) {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        checks.database = 'ok';
      }
    } catch (err) {
      return apiError('Database connection failed', {
        status: 503,
        requestId,
        code: 'DATABASE_CONNECTION_FAILED',
        details: { error: err instanceof Error ? err.message : 'Unknown error' },
      });
    }
  }

  return apiOk(
    {
      status: 'ready',
      checks,
      governance,
    },
    { requestId },
  );
}
