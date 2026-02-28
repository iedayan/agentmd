import { NextRequest } from 'next/server';
import { apiOk, getRequestId } from '@/lib/core/api-response';
import {
  evaluateGitHubGate,
  getGovernanceOperationalStats,
  listGitHubGates,
} from '@/lib/analytics/governance-data';
import { requireSessionUserId } from '@/lib/auth/session';

const OUTPUT_CONTRACT_CHECK = 'agentmd/output-contract';

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const governance = getGovernanceOperationalStats();
  const gates = listGitHubGates();

  const nonSuccessOutputContract = gates
    .map((gate) => {
      const status = gate.checks[OUTPUT_CONTRACT_CHECK] ?? 'missing';
      return {
        repositoryId: gate.repositoryId,
        repositoryName: gate.repositoryName,
        status,
        required: gate.requiredChecks.includes(OUTPUT_CONTRACT_CHECK),
        decision: evaluateGitHubGate(gate),
      };
    })
    .filter((entry) => entry.status !== 'success');

  return apiOk(
    {
      generatedAt: new Date().toISOString(),
      latestSync: {
        at: governance.lastGitHubSyncAt ?? null,
        summary: governance.lastGitHubSync ?? null,
      },
      nonSuccessOutputContract,
      totals: {
        repositories: gates.length,
        failingOrPendingOutputContract: nonSuccessOutputContract.length,
      },
    },
    { requestId },
  );
}
