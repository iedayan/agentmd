import { apiOk, getRequestId } from "@/lib/core/api-response";
import { listExecutions } from "@/lib/data/dashboard-data-facade";
import { requireSessionUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function fmtDay(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function GET() {
  const requestId = getRequestId();
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const executions = await listExecutions(userId, { limit: 200 });
  const total = executions.length;
  const failed = executions.filter((execution) => execution.status === "failed").length;
  const success = executions.filter((execution) => execution.status === "success").length;
  const running = executions.filter((execution) => execution.status === "running").length;

  const dayBuckets = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      date: fmtDay(date),
      running: 0,
      completed: 0,
      failed: 0,
    };
  });

  for (const execution of executions) {
    const key = execution.startedAt.slice(0, 10);
    const bucket = dayBuckets.find((item) => item.key === key);
    if (!bucket) continue;
    if (execution.status === "running" || execution.status === "pending") bucket.running += 1;
    if (execution.status === "success") bucket.completed += 1;
    if (execution.status === "failed") bucket.failed += 1;
  }

  const analytics = {
    pipelinesRun: total,
    pipelinesRunSparkline: dayBuckets.map((bucket) => bucket.running + bucket.completed + bucket.failed),
    policyViolationRate: total > 0 ? Math.round((failed / total) * 1000) / 10 : 0,
    policyViolationTrend: "down" as const,
    avgApprovalTimeHours: 0,
    approvalTimeTrend: "down" as const,
    agentSuccessRate: total > 0 ? Math.round((success / total) * 1000) / 10 : 0,
    violationsByRule: [
      { rule: "tool-allowlist-enforced", count: failed },
    ],
    pipelineVolume: dayBuckets.map((bucket) => ({
      date: bucket.date,
      running: bucket.running,
      completed: bucket.completed,
      failed: bucket.failed,
    })),
    mostBlockedAgents: Object.entries(
      executions
        .filter((execution) => execution.status === "failed")
        .reduce<Record<string, number>>((acc, execution) => {
          const sourceRef = `${execution.repositoryName}/AGENTS.md`;
          acc[sourceRef] = (acc[sourceRef] ?? 0) + 1;
          return acc;
        }, {})
    )
      .map(([sourceRef, count]) => ({ sourceRef, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };

  return apiOk(
    analytics,
    { requestId }
  );
}
