import { NextRequest } from 'next/server';
import { apiOk, getRequestId } from '@/lib/core/api-response';
import {
  getDashboardCounts,
  listExecutions,
  listRepositories,
} from '@/lib/data/dashboard-data-facade';
import { getGovernanceOperationalStats } from '@/lib/analytics/governance-data';
import { buildImpactMetrics } from '@/lib/analytics/impact';
import { requireSessionUserId } from '@/lib/auth/session';

type TrendPoint = {
  date: string;
  executions: number;
  failedExecutions: number;
  commandsRun: number;
  commandsFailed: number;
};

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const [executions, repositories, counts] = await Promise.all([
    listExecutions(userId, { limit: 500 }),
    listRepositories(userId),
    getDashboardCounts(userId),
  ]);
  const governance = getGovernanceOperationalStats();
  const impact = buildImpactMetrics(
    repositories,
    executions,
    counts.totalCommandsRun,
    counts.totalCommandsFailed,
  );

  const today = new Date();
  const trend: TrendPoint[] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayKey = day.toISOString().slice(0, 10);
    const dayExecutions = executions.filter(
      (execution) => execution.startedAt.slice(0, 10) === dayKey,
    );
    trend.push({
      date: dayKey,
      executions: dayExecutions.length,
      failedExecutions: dayExecutions.filter((item) => item.status === 'failed').length,
      commandsRun: dayExecutions.reduce((sum, item) => sum + item.commandsRun, 0),
      commandsFailed: dayExecutions.reduce((sum, item) => sum + item.commandsFailed, 0),
    });
  }

  const failurePreventionEstimate = Math.max(
    0,
    Math.round((counts.totalCommandsRun - counts.totalCommandsFailed) * 0.08),
  );

  const roiMultiple =
    impact.automationHoursSaved > 0
      ? Math.max(1, Number((impact.automationHoursSaved / 3).toFixed(2)))
      : 1;

  return apiOk(
    {
      impact,
      trend,
      kpis: {
        failurePreventionEstimate,
        roiMultiple,
        repositories: repositories.length,
        pendingApprovals: governance.pendingApprovals,
        blockedByPolicy: governance.blockedByPolicy,
      },
      governance,
    },
    { requestId },
  );
}
