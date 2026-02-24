import { NextRequest } from "next/server";
import { apiOk, getRequestId } from "@/lib/core/api-response";
import { listExecutions } from "@/lib/data/dashboard-data-facade";
import { requireSessionUserId } from "@/lib/auth/session";

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const url = new URL(req.url);
  const days = Math.max(7, Math.min(365, Number(url.searchParams.get("days") ?? 30) || 30));
  const hourlyRate = Math.max(
    25,
    Math.min(500, Number(url.searchParams.get("hourlyRateUsd") ?? 120) || 120)
  );
  const incidentCost = Math.max(
    200,
    Math.min(10000, Number(url.searchParams.get("incidentCostUsd") ?? 1500) || 1500)
  );
  const baselineFailureRate = Math.max(
    0.01,
    Math.min(0.95, Number(url.searchParams.get("baselineFailureRate") ?? 0.2) || 0.2)
  );
  const platformCostMonthly = Math.max(
    0,
    Math.min(50000, Number(url.searchParams.get("platformCostMonthlyUsd") ?? 40) || 40)
  );

  const executions = await listExecutions(userId, { limit: 5000 });
  const windowStart = Date.now() - days * 24 * 60 * 60 * 1000;
  const scoped = executions.filter((execution) => Date.parse(execution.startedAt) >= windowStart);
  const completed = scoped.filter(
    (execution) => execution.status === "success" || execution.status === "failed"
  );
  const failed = completed.filter((execution) => execution.status === "failed");

  const observedFailureRate = completed.length > 0 ? failed.length / completed.length : 0;
  const preventedFailures = Math.max(
    0,
    round((baselineFailureRate - observedFailureRate) * completed.length, 1)
  );

  const automationHoursSaved = round((completed.length * 8) / 60, 1);
  const laborValueUsd = round(automationHoursSaved * hourlyRate);
  const failureValueUsd = round(preventedFailures * incidentCost);
  const grossValueUsd = round(laborValueUsd + failureValueUsd);
  const platformCostUsd = round((platformCostMonthly * days) / 30);
  const netValueUsd = round(grossValueUsd - platformCostUsd);
  const roiMultiple = platformCostUsd > 0 ? round(grossValueUsd / platformCostUsd, 2) : 0;
  const paybackDays = grossValueUsd > 0 ? round((platformCostUsd / grossValueUsd) * days, 1) : null;

  const confidence =
    completed.length >= 300 ? "high" : completed.length >= 80 ? "medium" : "low";

  return apiOk(
    {
      periodDays: days,
      assumptions: {
        hourlyRateUsd: hourlyRate,
        incidentCostUsd: incidentCost,
        baselineFailureRate: round(baselineFailureRate * 100, 1),
        platformCostMonthlyUsd: platformCostMonthly,
      },
      metrics: {
        executionsAnalyzed: completed.length,
        observedFailureRate: round(observedFailureRate * 100, 1),
        automationHoursSaved,
        preventedFailures,
      },
      value: {
        laborValueUsd,
        failureValueUsd,
        grossValueUsd,
        platformCostUsd,
        netValueUsd,
        roiMultiple,
        paybackDays,
      },
      confidence,
    },
    { requestId }
  );
}
