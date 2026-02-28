'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from './empty-state';
import { ActionableInsights } from './actionable-insights';
import { ImpactPanel } from './impact-panel';
import { GovernanceOverview } from '@/components/enterprise/governance-overview';
import { ExecutionOverview } from './execution-overview';
import { RecentActivityFeed } from '@/components/enterprise/recent-activity-feed';
import { BadgeShareModal } from './badge-share-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GitBranch,
  Plus,
  RefreshCw,
  FolderGit2,
  ShieldCheck,
  Activity,
  Zap,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import type { Execution, Repository } from '@/types';
import { getPlan } from '@/lib/billing/plans';
import { cn } from '@/lib/core/utils';

export function RepositoryDashboard() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [runningRepoId, setRunningRepoId] = useState<string | null>(null);
  const [newRepoFullName, setNewRepoFullName] = useState('');
  const [repoSearch, setRepoSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'attention'>('all');
  const [syncing, setSyncing] = useState(false);
  const [badgeModalRepo, setBadgeModalRepo] = useState<{
    id: string;
    fullName: string;
    name: string;
  } | null>(null);

  const repositoryLimit = getPlan('free').repositories;
  const canAddRepo = typeof repositoryLimit === 'number' ? repos.length < repositoryLimit : true;
  const averageScore =
    repos.length > 0
      ? Math.round(repos.reduce((sum, repo) => sum + repo.healthScore, 0) / repos.length)
      : 0;
  const healthyCount = repos.filter((repo) => repo.healthScore >= 80).length;
  const filteredRepos = useMemo(() => {
    const query = repoSearch.trim().toLowerCase();
    return repos.filter((repo) => {
      const matchesSearch =
        !query ||
        repo.name.toLowerCase().includes(query) ||
        repo.fullName.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'healthy' ? repo.healthScore >= 80 : repo.healthScore < 80);
      return matchesSearch && matchesStatus;
    });
  }, [repoSearch, repos, statusFilter]);

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const [reposRes, execRes] = await Promise.all([
        fetch('/api/repositories', { cache: 'no-store' }),
        fetch('/api/executions?limit=10', { cache: 'no-store' }),
      ]);

      const reposData = (await reposRes.json()) as {
        ok?: boolean;
        repositories?: Repository[];
        error?: string;
      };
      const execData = (await execRes.json()) as {
        ok?: boolean;
        executions?: Execution[];
        error?: string;
      };

      if (!reposRes.ok || reposData.ok === false) {
        throw new Error(reposData.error ?? 'Unable to load repositories.');
      }
      setRepos(reposData.repositories ?? []);
      if (execData.ok) setExecutions(execData.executions ?? []);
    } catch (loadError) {
      setRepos([]);
      toast.error(loadError instanceof Error ? loadError.message : 'Load failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  const hasActiveExecutions = useMemo(
    () =>
      repos.some(
        (repo) =>
          repo.latestExecutionStatus === 'pending' || repo.latestExecutionStatus === 'running',
      ),
    [repos],
  );

  useEffect(() => {
    if (!hasActiveExecutions) return;
    const intervalId = setInterval(() => {
      void loadRepositories();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [hasActiveExecutions, loadRepositories]);

  // Removed local timeout logic

  const handleSyncGitHub = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/github/sync', { method: 'POST' });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        added?: number;
        skipped?: number;
        total?: number;
      };
      if (!res.ok || body.ok === false) {
        toast.error(body.error ?? 'Failed to sync from GitHub');
        return;
      }
      toast.success(
        body.added !== undefined ? `Synced: ${body.added} added` : 'Synced from GitHub',
      );
      await loadRepositories();
    } catch {
      toast.error('Failed to sync from GitHub');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectRepository = async () => {
    const fullName = newRepoFullName.trim();
    if (!fullName) return;
    setConnecting(true);
    try {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || body.ok === false) {
        toast.error(body.error ?? 'Failed to connect repository');
        return;
      }
      setNewRepoFullName('');
      toast.success(`Connected ${fullName}`);
      await loadRepositories();
    } catch {
      toast.error('Failed to connect repository');
    } finally {
      setConnecting(false);
    }
  };

  const handleRunRepository = async (repositoryId: string) => {
    setRunningRepoId(repositoryId);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          repositoryId,
          trigger: 'manual',
          agentId: 'pr-labeler',
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        dashboardExecution?: Execution;
      };
      if (!response.ok || body.ok === false) {
        toast.error(body.error ?? 'Failed to queue execution');
        return;
      }
      toast.success(
        body.dashboardExecution
          ? `Execution ${body.dashboardExecution.id} queued`
          : 'Execution queued',
      );
      await loadRepositories();
    } catch {
      toast.error('Failed to queue execution');
    } finally {
      setRunningRepoId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    if (score >= 50) return 'text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    return 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <ExecutionOverview />
        <GovernanceOverview />
        <RecentActivityFeed executions={executions} className="h-[300px] lg:h-auto" />
      </div>
      <div className="glass-card bg-primary/[0.03] border-primary/20 p-1">
        <CardContent className="py-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-glow/10">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-wider">
                  Quick Actions
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Maximize your agentic efficiency.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/executions">
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-tactile rounded-[0.75rem] px-5 font-bold border-border/60"
                >
                  View Runs
                </Button>
              </Link>
              <Link href="/docs/quickstart">
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-tactile rounded-[0.75rem] px-5 font-bold text-primary border-primary/20 hover:bg-primary/5"
                >
                  Quickstart
                </Button>
              </Link>
              <Link href="/dashboard/setup/agent">
                <Button
                  size="sm"
                  className="btn-tactile rounded-[0.75rem] px-6 font-bold shadow-glow border-beam"
                >
                  Setup Agent
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bento-card border-luminescent bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent p-2">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                Connected Repositories
              </CardDescription>
              <CardTitle className="text-5xl font-black text-gradient mt-2">
                {repos.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
              {typeof repositoryLimit === 'number'
                ? `${repositoryLimit - repos.length} SLOTS REMAINING`
                : 'ENTERPRISE UNLIMITED'}
            </CardContent>
          </div>
          <div className="bento-card p-2 bg-gradient-to-br from-emerald-500/[0.03] to-transparent">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">
                <ShieldCheck className="h-3.5 w-3.5" />
                Healthy Repositories
              </CardDescription>
              <CardTitle className="text-5xl font-black text-gradient mt-2">
                {healthyCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest font-mono">
              SCORE &gt; 80% EFFICIENCY
            </CardContent>
          </div>
          <div className="bento-card p-2 bg-gradient-to-br from-amber-500/[0.03] to-transparent">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70">
                <Activity className="h-3.5 w-3.5" />
                Average Readiness
              </CardDescription>
              <CardTitle className="text-5xl font-black text-gradient mt-2">
                {averageScore}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest font-mono">
              AGENTS.MD COMPLIANCE
            </CardContent>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full lg:max-w-md">
                <Input
                  value={newRepoFullName}
                  onChange={(event) => setNewRepoFullName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      if (!connecting && canAddRepo && newRepoFullName.trim()) {
                        void handleConnectRepository();
                      }
                    }
                  }}
                  placeholder="owner/repo (e.g. acme/my-app)"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadRepositories()}
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  disabled={!canAddRepo || connecting || !newRepoFullName.trim()}
                  onClick={handleConnectRepository}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {connecting ? 'Connecting...' : 'Connect Repo'}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-xs">
                <Input
                  value={repoSearch}
                  onChange={(event) => setRepoSearch(event.target.value)}
                  placeholder="Search repositories..."
                  aria-label="Search repositories"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as 'all' | 'healthy' | 'attention')}
                >
                  <SelectTrigger className="w-[180px]" aria-label="Filter by health status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All repositories</SelectItem>
                    <SelectItem value="healthy">Healthy only (80+)</SelectItem>
                    <SelectItem value="attention">Needs attention (&lt;80)</SelectItem>
                  </SelectContent>
                </Select>
                {(repoSearch || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRepoSearch('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing {filteredRepos.length} of {repos.length} repositories
              {' · '}
              <Link href="/api/github/install" className="text-primary hover:underline">
                Connect with GitHub App
              </Link>
              {' · '}
              <button
                type="button"
                onClick={handleSyncGitHub}
                disabled={syncing}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Sync from GitHub'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      <ActionableInsights
        repositories={repos}
        repositoryLimit={typeof repositoryLimit === 'number' ? repositoryLimit : 'unlimited'}
      />

      <ImpactPanel repositories={repos} />

      {!loading && repos.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-12 w-12" />}
          title="Add your first repo"
          description="Paste owner/repo above (e.g. acme/my-app) and click Connect. We'll find or create AGENTS.md — no config needed."
          action={{ label: 'Quickstart Guide', href: '/docs/quickstart' }}
        />
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepos.map((repo, idx) => (
            <div
              key={repo.id}
              className={cn(
                'bento-card border-luminescent group hover:shadow-glow/10 animate-fade-up',
                idx === 1 && 'animation-delay-100',
                idx === 2 && 'animation-delay-200',
                idx > 2 && 'animation-delay-300',
              )}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6 p-6">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shadow-sm border border-border/40">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-foreground/90 tracking-tight">
                      {repo.name}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate max-w-[140px] opacity-60">
                      {repo.fullName}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-base font-black shadow-sm',
                    repo.healthScore >= 80
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : repo.healthScore >= 50
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20',
                  )}
                >
                  {repo.healthScore}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-0">
                <div>
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-2.5">
                    <span>Repository Fitness</span>
                    <span className={cn('font-black', getScoreColor(repo.healthScore))}>
                      {repo.healthScore}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/20 shadow-inner">
                    <div
                      className={cn(
                        'h-full transition-all duration-1000 ease-out',
                        repo.healthScore >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : repo.healthScore >= 50
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                            : 'bg-gradient-to-r from-red-500 to-red-400',
                      )}
                      style={{ width: `${repo.healthScore}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/40 bg-muted/20 p-3 text-center transition-colors group-hover:bg-muted/40">
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">
                      Agents
                    </p>
                    <p className="text-base font-black text-foreground/80">{repo.agentsMdCount}</p>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-muted/20 p-3 text-center transition-colors group-hover:bg-muted/40 text-ellipsis overflow-hidden">
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">
                      Last Sync
                    </p>
                    <p className="text-base font-black text-foreground/80 truncate">
                      {repo.lastValidated
                        ? new Date(repo.lastValidated).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Never'}
                    </p>
                  </div>
                </div>

                {repo.latestExecutionStatus || repo.healthDrift ? (
                  <div className="flex flex-col gap-2">
                    {repo.healthDrift && (
                      <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs shadow-sm animate-pulse">
                        <div className="flex items-center gap-3 text-amber-500">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span className="font-black uppercase tracking-widest text-[10px]">
                            Health Drift Detected
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-amber-500/80 uppercase">
                          Out of sync
                        </span>
                      </div>
                    )}

                    {repo.latestExecutionStatus && (
                      <div className="flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/[0.03] px-4 py-3 text-xs shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-2.5 w-2.5">
                            <span
                              className={cn(
                                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                                repo.latestExecutionStatus === 'running' ? 'bg-primary' : 'hidden',
                              )}
                            ></span>
                            <span
                              className={cn(
                                'relative inline-flex rounded-full h-2.5 w-2.5',
                                repo.latestExecutionStatus === 'success'
                                  ? 'bg-emerald-500 animate-glow-pulse'
                                  : repo.latestExecutionStatus === 'failed'
                                    ? 'bg-red-500 border border-red-400'
                                    : repo.latestExecutionStatus === 'running'
                                      ? 'bg-primary'
                                      : 'bg-muted-foreground/50',
                              )}
                            ></span>
                          </span>
                          <span className="font-black uppercase tracking-widest text-[10px] text-muted-foreground/80">
                            Status
                          </span>
                        </div>
                        <span
                          className={cn(
                            'font-black uppercase tracking-tighter text-[11px] px-2 py-0.5 rounded-md',
                            repo.latestExecutionStatus === 'success'
                              ? 'text-emerald-500 bg-emerald-500/5'
                              : repo.latestExecutionStatus === 'failed'
                                ? 'text-red-500 bg-red-500/5'
                                : repo.latestExecutionStatus === 'running'
                                  ? 'text-primary bg-primary/5'
                                  : 'text-muted-foreground bg-muted/5',
                          )}
                        >
                          {repo.latestExecutionStatus}
                        </span>
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 pt-2">
                  {repo.healthScore < 80 && (
                    <Link href="/docs/parse" className="w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full rounded-2xl text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30"
                      >
                        Improve fitness score →
                      </Button>
                    </Link>
                  )}
                  <div className="flex gap-3">
                    <Link
                      href={
                        repo.latestExecutionId
                          ? `/dashboard/executions/${repo.latestExecutionId}`
                          : '/dashboard/executions'
                      }
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-2xl btn-tactile font-black text-[10px] uppercase tracking-widest py-5 border-border/60"
                      >
                        Inspect
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-4 rounded-2xl btn-tactile font-black text-[10px] uppercase tracking-widest py-5 border-border/60"
                      onClick={() =>
                        setBadgeModalRepo({ id: repo.id, fullName: repo.fullName, name: repo.name })
                      }
                      title="Share Badge"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 rounded-2xl btn-tactile font-black text-[10px] uppercase tracking-widest py-5 shadow-glow/10"
                      disabled={runningRepoId === repo.id}
                      onClick={() => void handleRunRepository(repo.id)}
                    >
                      {runningRepoId === repo.id ? 'Working...' : 'Execute'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
          {filteredRepos.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No repositories match your current filters.
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {badgeModalRepo && (
        <BadgeShareModal
          isOpen={!!badgeModalRepo}
          onClose={() => setBadgeModalRepo(null)}
          repoFullName={badgeModalRepo.fullName}
          repoName={badgeModalRepo.name}
        />
      )}
    </div>
  );
}
