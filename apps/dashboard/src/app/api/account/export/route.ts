/**
 * Export user data as JSON.
 */
import { NextRequest } from 'next/server';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { requireSessionUserId } from '@/lib/auth/session';
import { listRepositories, listExecutions } from '@/lib/data/dashboard-data-facade';
import { getPool } from '@/lib/data/db';

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  try {
    const [repos, executions] = await Promise.all([
      listRepositories(userId),
      listExecutions(userId, { limit: 500 }),
    ]);

    const pool = getPool();
    let profile: Record<string, unknown> = {};
    if (pool) {
      const userRes = await pool.query(
        `SELECT id, name, email, image, created_at FROM users WHERE id = $1`,
        [userId],
      );
      const u = userRes.rows[0];
      if (u) {
        profile = {
          id: u.id,
          name: u.name,
          email: u.email,
          image: u.image,
          createdAt: (u.created_at as Date)?.toISOString?.(),
        };
      }
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile,
      repositories: repos,
      executions: executions.map((e) => ({
        id: e.id,
        repositoryId: e.repositoryId,
        trigger: e.trigger,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
      })),
    };

    return apiOk(exportData, {
      requestId,
      headers: {
        'Content-Disposition': `attachment; filename="agentmd-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return apiError('Failed to export data', { status: 500, requestId });
  }
}
