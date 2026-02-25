"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "./empty-state";
import { ActionableInsights } from "./actionable-insights";
import { ImpactPanel } from "./impact-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitBranch, Plus, RefreshCw, FolderGit2, ShieldCheck, Activity, Zap } from "lucide-react";
import type { Execution, Repository } from "@/types";
import { getPlan } from "@/lib/billing/plans";
import { cn } from "@/lib/core/utils";

export function RepositoryDashboard() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [runningRepoId, setRunningRepoId] = useState<string | null>(null);
  const [newRepoFullName, setNewRepoFullName] = useState("");
  const [repoSearch, setRepoSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "attention">("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const repositoryLimit = getPlan("free").repositories;
  const canAddRepo = typeof repositoryLimit === "number" ? repos.length < repositoryLimit : true;
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
        statusFilter === "all" ||
        (statusFilter === "healthy" ? repo.healthScore >= 80 : repo.healthScore < 80);
      return matchesSearch && matchesStatus;
    });
  }, [repoSearch, repos, statusFilter]);

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/repositories", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        repositories?: Repository[];
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "Unable to load repositories right now.");
      }
      setRepos(data.repositories ?? []);
      setError(null);
    } catch (loadError) {
      setRepos([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load repositories right now."
      );
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
          repo.latestExecutionStatus === "pending" ||
          repo.latestExecutionStatus === "running"
      ),
    [repos]
  );

  useEffect(() => {
    if (!hasActiveExecutions) return;
    const intervalId = setInterval(() => {
      void loadRepositories();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [hasActiveExecutions, loadRepositories]);

  useEffect(() => {
    if (!message) return;
    const timeoutId = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timeoutId);
  }, [message]);

  const handleSyncGitHub = async () => {
    setSyncing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        added?: number;
        skipped?: number;
        total?: number;
      };
      if (!res.ok || body.ok === false) {
        setError(body.error ?? "Failed to sync from GitHub");
        return;
      }
      setMessage(
        body.added !== undefined
          ? `Synced: ${body.added} added, ${body.skipped ?? 0} already connected`
          : "Synced from GitHub"
      );
      await loadRepositories();
    } catch {
      setError("Failed to sync from GitHub");
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectRepository = async () => {
    const fullName = newRepoFullName.trim();
    if (!fullName) return;
    setConnecting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || body.ok === false) {
        setError(body.error ?? "Failed to connect repository");
        return;
      }
      setNewRepoFullName("");
      setMessage(`Connected ${fullName}`);
      await loadRepositories();
    } catch {
      setError("Failed to connect repository");
    } finally {
      setConnecting(false);
    }
  };

  const handleRunRepository = async (repositoryId: string) => {
    setRunningRepoId(repositoryId);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          repositoryId,
          trigger: "manual",
          agentId: "pr-labeler",
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        dashboardExecution?: Execution;
      };
      if (!response.ok || body.ok === false) {
        setError(body.error ?? "Failed to queue execution");
        return;
      }
      setMessage(
        body.dashboardExecution
          ? `Execution ${body.dashboardExecution.id} queued`
          : "Execution queued"
      );
    } catch {
      setError("Failed to queue execution");
    } finally {
      setRunningRepoId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
    if (score >= 50) return "text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    return "text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
  };

  return (
    <div className="space-y-6">
      <div className="bento-card bg-primary/5 border-primary/20">
        <CardContent className="py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Quick Actions</p>
                <p className="text-xs text-muted-foreground">
                  Common tasks to maximize your agentic efficiency.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/dashboard/executions">
                <Button size="sm" variant="outline" className="btn-tactile rounded-xl">View Runs</Button>
              </Link>
              <Link href="/docs/quickstart">
                <Button size="sm" variant="outline" className="btn-tactile rounded-xl text-primary border-primary/20 hover:bg-primary/5">Quickstart</Button>
              </Link>
              <Link href="/dashboard/setup/agent">
                <Button size="sm" className="btn-tactile rounded-xl shadow-glow">Setup Agent</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bento-card border-luminescent bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-primary/70">Connected Repositories</CardDescription>
            <CardTitle className="text-4xl font-black text-gradient">{repos.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[10px] text-muted-foreground/80 font-medium">
            {typeof repositoryLimit === "number"
              ? `${repositoryLimit - repos.length} slots remaining in free tier`
              : "Enterprise unlimited tier active"}
          </CardContent>
        </div>
        <div className="bento-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500/70">
              <ShieldCheck className="h-3.5 w-3.5" />
              Healthy Repositories
            </CardDescription>
            <CardTitle className="text-4xl font-black text-gradient">{healthyCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[10px] text-muted-foreground/80 font-medium font-mono">
            SCORE &gt; 80% EFFICIENCY
          </CardContent>
        </div>
        <div className="bento-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500/70">
              <Activity className="h-3.5 w-3.5" />
              Average Readiness
            </CardDescription>
            <CardTitle className="text-4xl font-black text-gradient">{averageScore}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[10px] text-muted-foreground/80 font-medium font-mono">
            AGENTS.MD COMPLIANCE AGGREGATE
          </CardContent>
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
                    if (event.key === "Enter") {
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
                  {connecting ? "Connecting..." : "Connect Repo"}
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
                  onValueChange={(v) =>
                    setStatusFilter(v as "all" | "healthy" | "attention")
                  }
                >
                  <SelectTrigger
                    className="w-[180px]"
                    aria-label="Filter by health status"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All repositories</SelectItem>
                    <SelectItem value="healthy">Healthy only (80+)</SelectItem>
                    <SelectItem value="attention">
                      Needs attention (&lt;80)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {(repoSearch || statusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRepoSearch("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing {filteredRepos.length} of {repos.length} repositories
              {" · "}
              <Link href="/api/github/install" className="text-primary hover:underline">
                Connect with GitHub App
              </Link>
              {" · "}
              <button
                type="button"
                onClick={handleSyncGitHub}
                disabled={syncing}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {syncing ? "Syncing..." : "Sync from GitHub"}
              </button>
            </p>
          </div>
          {message ? (
            <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ActionableInsights
        repositories={repos}
        repositoryLimit={typeof repositoryLimit === "number" ? repositoryLimit : "unlimited"}
      />

      <ImpactPanel repositories={repos} />

      {!loading && repos.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-12 w-12" />}
          title="Add your first repo"
          description="Paste owner/repo above (e.g. acme/my-app) and click Connect. We'll find or create AGENTS.md — no config needed."
          action={{ label: "Quickstart Guide", href: "/docs/quickstart" }}
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
          {filteredRepos.map((repo) => (
            <div key={repo.id} className="bento-card border-luminescent group hover:shadow-glow/20">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground/90">{repo.name}</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{repo.fullName}</p>
                  </div>
                </div>
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-black",
                  repo.healthScore >= 80 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    repo.healthScore >= 50 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {repo.healthScore}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                    <span>Repository Fitness</span>
                    <span className={getScoreColor(repo.healthScore)}>
                      {repo.healthScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-1000 ease-out",
                        repo.healthScore >= 80 ? "bg-emerald-500" :
                          repo.healthScore >= 50 ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${repo.healthScore}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-2 text-center">
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">Agents</p>
                    <p className="text-sm font-bold text-foreground/80">{repo.agentsMdCount}</p>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-2 text-center">
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">Last Sync</p>
                    <p className="text-sm font-bold text-foreground/80 truncate">
                      {repo.lastValidated
                        ? new Date(repo.lastValidated).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : "Never"}
                    </p>
                  </div>
                </div>

                {repo.latestExecutionStatus ? (
                  <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/[0.02] px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className={cn(
                          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                          repo.latestExecutionStatus === 'running' ? 'bg-primary' : 'hidden'
                        )}></span>
                        <span className={cn(
                          "relative inline-flex rounded-full h-2 w-2",
                          repo.latestExecutionStatus === 'success' ? 'bg-emerald-500' :
                            repo.latestExecutionStatus === 'failed' ? 'bg-red-500' :
                              repo.latestExecutionStatus === 'running' ? 'bg-primary' : 'bg-muted-foreground'
                        )}></span>
                      </span>
                      <span className="font-medium text-muted-foreground">Status</span>
                    </div>
                    <span className={cn(
                      "font-bold uppercase tracking-tighter text-[10px]",
                      repo.latestExecutionStatus === 'success' ? 'text-emerald-500' :
                        repo.latestExecutionStatus === 'failed' ? 'text-red-500' :
                          repo.latestExecutionStatus === 'running' ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {repo.latestExecutionStatus}
                    </span>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <Link
                    href={
                      repo.latestExecutionId
                        ? `/dashboard/executions/${repo.latestExecutionId}`
                        : "/dashboard/executions"
                    }
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full rounded-xl btn-tactile font-bold text-xs">
                      Inspect
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl btn-tactile font-bold text-xs"
                    disabled={runningRepoId === repo.id}
                    onClick={() => void handleRunRepository(repo.id)}
                  >
                    {runningRepoId === repo.id ? "Working..." : "Execute"}
                  </Button>
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
    </div>
  );
}
