import { NextRequest } from "next/server";
import { existsSync } from "fs";
import { apiOk, getRequestId } from "@/lib/core/api-response";
import { getDashboardCounts, listAuditLogs } from "@/lib/data/dashboard-data-facade";
import { getGovernanceOperationalStats } from "@/lib/analytics/governance-data";
import { getReliabilityStats } from "@/lib/analytics/reliability-data";
import { requireSessionUserId } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const governance = getGovernanceOperationalStats();
  const reliability = getReliabilityStats();
  const [counts, recentAudit] = await Promise.all([
    getDashboardCounts(userId),
    listAuditLogs(userId, 20),
  ]);

  const checks = [
    {
      id: "governance-persistence",
      label: "Governance state persistence",
      status: existsSync(governance.persistedStatePath) ? "ok" : "warn",
      detail: governance.persistedStatePath,
    },
    {
      id: "github-webhook-secret",
      label: "GitHub webhook signing secret",
      status: process.env.GITHUB_WEBHOOK_SECRET ? "ok" : "warn",
      detail: process.env.GITHUB_WEBHOOK_SECRET
        ? "Configured"
        : "Set GITHUB_WEBHOOK_SECRET",
    },
    {
      id: "slack-webhook",
      label: "Slack notifications webhook",
      status: process.env.SLACK_WEBHOOK_URL ? "ok" : "info",
      detail: process.env.SLACK_WEBHOOK_URL ? "Configured" : "Optional",
    },
    {
      id: "webhook-success-rate",
      label: "GitHub webhook success rate",
      status:
        governance.webhookReceived === 0
          ? "info"
          : governance.webhookSuccessRate >= 95
          ? "ok"
          : "warn",
      detail:
        governance.webhookReceived === 0
          ? "No webhook events received yet"
          : `${governance.webhookSuccessRate}%`,
    },
    {
      id: "duplicate-delivery-rate",
      label: "Webhook duplicate delivery rate",
      status: reliability.duplicateRate < 5 ? "ok" : "warn",
      detail: `${reliability.duplicateRate}%`,
    },
  ] as const;

  const openIncidents: string[] = [];
  if (governance.pendingApprovals > 0) {
    openIncidents.push(`${governance.pendingApprovals} pending approvals require action.`);
  }
  if (governance.webhookSignatureFailures > 0) {
    openIncidents.push(
      `${governance.webhookSignatureFailures} webhook signature failures observed.`
    );
  }
  if (reliability.openIncidents > 0) {
    openIncidents.push(`${reliability.openIncidents} reliability incidents currently open.`);
  }

  return apiOk(
    {
      service: "agentmd-dashboard",
      generatedAt: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks,
      governance,
      reliability,
      usage: counts,
      incidents: openIncidents,
      recentAudit,
    },
    { requestId }
  );
}
