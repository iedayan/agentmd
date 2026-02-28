import { getDashboardCounts } from '@/lib/data/dashboard-data';
import { apiOk } from '@/lib/core/api-response';

/**
 * Health check endpoint for load balancers and smoke tests.
 * Returns 200 if the app is running.
 */
export async function GET() {
  const counts = getDashboardCounts();
  return apiOk({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'agentmd-dashboard',
    uptimeSeconds: Math.round(process.uptime()),
    commitSha:
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? null,
    counts,
  });
}
