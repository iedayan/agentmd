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
import { GitBranch, Plus, RefreshCw, FolderGit2, ShieldCheck, Activity } from "lucide-react";
import type { Execution, Repository } from "@/types";
import { getPlan } from "@/lib/billing/plans";

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
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium">Quick Actions</p>
              <p className="text-xs text-muted-foreground">
                Common tasks to get value quickly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/executions">
                <Button size="sm" variant="outline">View Runs</Button>
              </Link>
              <Link href="/docs/quickstart">
                <Button size="sm" variant="outline">Quickstart</Button>
              </Link>
              <Link href="/marketplace">
                <Button size="sm">Explore Agents</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader className="pb-2">
            <CardDescription>Connected Repositories</CardDescription>
            <CardTitle className="text-3xl">{repos.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            {typeof repositoryLimit === "number"
              ? `${repositoryLimit - repos.length} remaining on Free plan`
              : "Unlimited on current plan"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Healthy Repositories
            </CardDescription>
            <CardTitle className="text-3xl">{healthyCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Score 80+ across all connected repos
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Average Readiness
            </CardDescription>
            <CardTitle className="text-3xl">{averageScore}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Health score averaged over active repositories
          </CardContent>
        </Card>
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
                  placeholder="Connect repo: owner/name (e.g. acme/my-app)"
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
          title="No repositories yet"
          description="Connect your first repository, or add AGENTS.md locally and run agentmd validate to get started."
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
            <Card key={repo.id} className="hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{repo.name}</CardTitle>
                </div>
                <Badge
                  variant={repo.healthScore >= 80 ? "success" : repo.healthScore >= 50 ? "warning" : "destructive"}
                >
                  {repo.healthScore}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{repo.fullName}</CardDescription>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Agent-readiness</span>
                    <span className={getScoreColor(repo.healthScore)}>
                      {repo.healthScore}/100
                    </span>
                  </div>
                  <Progress value={repo.healthScore} className="h-2" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{repo.agentsMdCount} AGENTS.md</span>
                  <span>
                    {repo.lastValidated
                      ? new Date(repo.lastValidated).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
                {repo.latestExecutionStatus ? (
                  <div className="flex items-center justify-between rounded-md border border-border/60 px-2 py-1 text-xs">
                    <span className="text-muted-foreground">Latest execution</span>
                    <Badge
                      variant={
                        repo.latestExecutionStatus === "success"
                          ? "success"
                          : repo.latestExecutionStatus === "failed"
                          ? "destructive"
                          : repo.latestExecutionStatus === "running"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {repo.latestExecutionStatus}
                    </Badge>
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
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={runningRepoId === repo.id}
                    onClick={() => void handleRunRepository(repo.id)}
                  >
                    {runningRepoId === repo.id ? "Queuing..." : "Run"}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
