import { NextRequest } from 'next/server';
import { apiOk, getRequestId } from '@/lib/core/api-response';
import {
  listApprovalRequests,
  getGovernanceOperationalStats,
} from '@/lib/analytics/governance-data';
import { getReliabilityStats } from '@/lib/analytics/reliability-data';
import { requireSessionUserId } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[index] ?? 0;
}

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const governance = getGovernanceOperationalStats();
  const reliability = getReliabilityStats();
  const approvalLatencyMinutes = listApprovalRequests()
    .filter((approval) => approval.decidedAt)
    .map((approval) =>
      Math.max(
        0,
        (Date.parse(approval.decidedAt ?? approval.createdAt) - Date.parse(approval.createdAt)) /
          60000,
      ),
    );

  const approvalP95 = Math.round(percentile(approvalLatencyMinutes, 0.95) * 10) / 10;

  const objectives = [
    {
      id: 'webhook-success-rate',
      target: '>=99%',
      actual: `${governance.webhookSuccessRate}%`,
      passed: governance.webhookSuccessRate >= 99,
    },
    {
      id: 'duplicate-delivery-rate',
      target: '<5%',
      actual: `${reliability.duplicateRate}%`,
      passed: reliability.duplicateRate < 5,
    },
    {
      id: 'approval-latency-p95',
      target: '<=30m',
      actual: `${approvalP95}m`,
      passed: approvalP95 <= 30 || approvalP95 === 0,
    },
    {
      id: 'open-incidents',
      target: '<=2',
      actual: String(reliability.openIncidents),
      passed: reliability.openIncidents <= 2,
    },
  ];

  return apiOk(
    {
      generatedAt: new Date().toISOString(),
      status: objectives.every((objective) => objective.passed) ? 'healthy' : 'degraded',
      objectives,
      metrics: {
        webhookSuccessRate: governance.webhookSuccessRate,
        duplicateDeliveryRate: reliability.duplicateRate,
        approvalLatencyP95Minutes: approvalP95,
        mttrMinutes: reliability.mttrMinutes,
        openIncidents: reliability.openIncidents,
      },
      reliability,
    },
    { requestId },
  );
}
