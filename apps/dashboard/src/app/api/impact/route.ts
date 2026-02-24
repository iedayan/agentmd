import { NextRequest } from "next/server";
import { apiOk, getRequestId } from "@/lib/core/api-response";
import { getDashboardCounts, listExecutions, listRepositories } from "@/lib/data/dashboard-data-facade";
import { buildImpactMetrics } from "@/lib/analytics/impact";
import { requireSessionUserId } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const [repositories, executions, counts] = await Promise.all([
    listRepositories(userId),
    listExecutions(userId, { limit: 200 }),
    getDashboardCounts(userId),
  ]);
  const impact = buildImpactMetrics(
    repositories,
    executions,
    counts.totalCommandsRun,
    counts.totalCommandsFailed
  );

  return apiOk(
    {
      impact,
      meta: {
        generatedAt: new Date().toISOString(),
      },
    },
    { requestId }
  );
}
