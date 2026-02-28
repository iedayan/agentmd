import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireSessionUserId: vi.fn(),
  getGitHubInstallation: vi.fn(),
  hasRepositoryFullName: vi.fn(),
  addRepository: vi.fn(),
  listRepositories: vi.fn(),
  listInstallationRepositories: vi.fn(),
  setGitHubRequiredChecks: vi.fn(),
  recordGitHubSyncSummary: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  requireSessionUserId: mocks.requireSessionUserId,
}));

vi.mock('@/lib/data/dashboard-data-facade', () => ({
  getGitHubInstallation: mocks.getGitHubInstallation,
  hasRepositoryFullName: mocks.hasRepositoryFullName,
  addRepository: mocks.addRepository,
  listRepositories: mocks.listRepositories,
}));

vi.mock('@/lib/integrations/github-app', () => ({
  listInstallationRepositories: mocks.listInstallationRepositories,
}));

vi.mock('@/lib/analytics/governance-data', () => ({
  setGitHubRequiredChecks: mocks.setGitHubRequiredChecks,
  recordGitHubSyncSummary: mocks.recordGitHubSyncSummary,
}));

import { POST } from '../route';

function createRequest() {
  return new Request('http://localhost/api/github/sync', { method: 'POST' });
}

describe('POST /api/github/sync', () => {
  beforeEach(() => {
    mocks.requireSessionUserId.mockReset();
    mocks.getGitHubInstallation.mockReset();
    mocks.hasRepositoryFullName.mockReset();
    mocks.addRepository.mockReset();
    mocks.listRepositories.mockReset();
    mocks.listInstallationRepositories.mockReset();
    mocks.setGitHubRequiredChecks.mockReset();
    mocks.recordGitHubSyncSummary.mockReset();
  });

  it('returns 404 when user has no installation', async () => {
    mocks.requireSessionUserId.mockResolvedValue('user-1');
    mocks.getGitHubInstallation.mockResolvedValue(null);
    mocks.listRepositories.mockResolvedValue([]);

    const res = await POST(createRequest() as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.code).toBe('NO_INSTALLATION');
  });

  it('applies default required checks including output-contract for new repos', async () => {
    mocks.requireSessionUserId.mockResolvedValue('user-1');
    mocks.getGitHubInstallation.mockResolvedValue({ installationId: 'inst-1' });
    mocks.listRepositories.mockResolvedValue([]);
    mocks.listInstallationRepositories.mockResolvedValue([
      {
        id: 1,
        full_name: 'acme/repo-one',
        name: 'repo-one',
        owner: { login: 'acme' },
        private: false,
      },
    ]);
    mocks.hasRepositoryFullName.mockResolvedValue(false);
    mocks.addRepository.mockResolvedValue({ id: 'repo-1' });

    const res = await POST(createRequest() as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.added).toBe(1);
    expect(json.gateUpdated).toBe(1);
    expect(mocks.setGitHubRequiredChecks).toHaveBeenCalledWith('repo-1', [
      'agentmd/parse',
      'agentmd/policy-gate',
      'agentmd/output-contract',
    ]);
    expect(mocks.recordGitHubSyncSummary).toHaveBeenCalled();
  });

  it('updates required checks for existing synced repos', async () => {
    mocks.requireSessionUserId.mockResolvedValue('user-1');
    mocks.getGitHubInstallation.mockResolvedValue({ installationId: 'inst-1' });
    mocks.listRepositories.mockResolvedValue([{ id: 'repo-existing', fullName: 'acme/repo-one' }]);
    mocks.listInstallationRepositories.mockResolvedValue([
      {
        id: 1,
        full_name: 'acme/repo-one',
        name: 'repo-one',
        owner: { login: 'acme' },
        private: false,
      },
    ]);
    mocks.hasRepositoryFullName.mockResolvedValue(true);

    const res = await POST(createRequest() as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.added).toBe(0);
    expect(json.skipped).toBe(1);
    expect(json.gateUpdated).toBe(1);
    expect(mocks.setGitHubRequiredChecks).toHaveBeenCalledWith('repo-existing', [
      'agentmd/parse',
      'agentmd/policy-gate',
      'agentmd/output-contract',
    ]);
    expect(json.backfilledRepositories).toEqual([{ id: 'repo-existing', name: 'acme/repo-one' }]);
  });
});
