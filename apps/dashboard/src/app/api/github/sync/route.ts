/**
 * Sync repositories from GitHub App installation.
 * Adds repos the user has access to via their GitHub App installation.
 */
import { NextRequest } from 'next/server';
import {
  getGitHubInstallation,
  hasRepositoryFullName,
  addRepository,
  listRepositories,
} from '@/lib/data/dashboard-data-facade';
import { listInstallationRepositories } from '@/lib/integrations/github-app';
import { requireSessionUserId } from '@/lib/auth/session';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';
import { recordGitHubSyncSummary, setGitHubRequiredChecks } from '@/lib/analytics/governance-data';

const DEFAULT_GITHUB_APP_REQUIRED_CHECKS = [
  'agentmd/parse',
  'agentmd/policy-gate',
  'agentmd/output-contract',
];

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const installation = await getGitHubInstallation(userId);
  if (!installation) {
    return apiError('No GitHub App installation found. Connect with GitHub first.', {
      status: 404,
      requestId,
      code: 'NO_INSTALLATION',
    });
  }

  try {
    const githubRepos = await listInstallationRepositories(installation.installationId);
    const existingRepositories = await listRepositories(userId);
    const existingByFullName = new Map(
      existingRepositories.map((repo) => [repo.fullName.toLowerCase(), repo]),
    );
    let added = 0;
    let skipped = 0;
    let gateUpdated = 0;
    const backfilledRepositories: Array<{ id: string; name: string }> = [];

    for (const repo of githubRepos) {
      const fullName = repo.full_name;
      const exists = await hasRepositoryFullName(userId, fullName);
      if (exists) {
        const existing = existingByFullName.get(fullName.toLowerCase());
        if (existing) {
          setGitHubRequiredChecks(existing.id, DEFAULT_GITHUB_APP_REQUIRED_CHECKS);
          gateUpdated++;
          backfilledRepositories.push({ id: existing.id, name: existing.fullName });
        }
        skipped++;
        continue;
      }
      const repository = await addRepository(userId, {
        owner: repo.owner.login,
        name: repo.name,
        fullName,
        healthScore: 70,
        agentsMdCount: 1,
      });
      setGitHubRequiredChecks(repository.id, DEFAULT_GITHUB_APP_REQUIRED_CHECKS);
      gateUpdated++;
      added++;
    }

    recordGitHubSyncSummary({
      total: githubRepos.length,
      added,
      skipped,
      gateUpdated,
      backfilledRepositories,
    });

    return apiOk(
      {
        synced: true,
        added,
        skipped,
        gateUpdated,
        backfilledRepositories,
        total: githubRepos.length,
      },
      { requestId },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GitHub API error';
    return apiError(`Failed to sync repositories: ${message}`, {
      status: 502,
      requestId,
      code: 'GITHUB_SYNC_FAILED',
    });
  }
}
