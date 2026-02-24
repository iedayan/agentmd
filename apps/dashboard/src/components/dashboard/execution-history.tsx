"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Play } from "lucide-react";
import type { Execution } from "@/types";
import { getPlan } from "@/lib/billing/plans";
export function ExecutionHistory() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [executionMinutesUsed, setExecutionMinutesUsed] = useState(0);
  const [meta, setMeta] = useState<{
    totalCommandsRun?: number;
    totalCommandsFailed?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [queuing, setQueuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executionLimit = getPlan("free").executionMinutes;

  const loadExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/executions", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        executions?: Execution[];
        meta?: {
          executionMinutesUsed?: number;
          totalCommandsRun?: number;
          totalCommandsFailed?: number;
        };
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "Unable to load executions right now.");
      }
      setExecutions(data.executions ?? []);
      setExecutionMinutesUsed(data.meta?.executionMinutesUsed ?? 0);
      setMeta(data.meta ?? {});
      setError(null);
    } catch (loadError) {
      setExecutions([]);
      setExecutionMinutesUsed(0);
      setMeta({});
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load executions right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExecutions();
  }, [loadExecutions]);

  const hasActiveExecutions = useMemo(
    () => executions.some((ex) => ex.status === "pending" || ex.status === "running"),
    [executions]
  );

  useEffect(() => {
    if (!hasActiveExecutions) return;
    const intervalId = setInterval(() => {
      void loadExecutions();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [hasActiveExecutions, loadExecutions]);

  const queueManualExecution = async () => {
    setQueuing(true);
    setError(null);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          trigger: "manual",
          agentId: "pr-labeler",
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        dashboardExecution?: Execution;
      };
      if (!response.ok || data.ok === false) {
        setError(data.error ?? "Failed to queue execution");
        return;
      }
      if (data.dashboardExecution) {
        setExecutions((prev) => [data.dashboardExecution as Execution, ...prev]);
      }
      await loadExecutions();
    } catch {
      setError("Failed to queue execution");
    } finally {
      setQueuing(false);
    }
  };

  const statusIcon = (status: Execution["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-amber-500" />;
      case "running":
        return <Play className="h-4 w-4 text-primary animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const triggerLabel = (t: Execution["trigger"]) =>
    t === "pull_request" ? "PR" : t.charAt(0).toUpperCase() + t.slice(1);
  const statusCounts = executions.reduce(
    (acc, execution) => {
      const s = execution.status;
      if (s in acc) (acc as Record<string, number>)[s] += 1;
      else (acc as Record<string, number>)[s] = 1;
      return acc;
    },
    { pending: 0, running: 0, success: 0, failed: 0, cancelled: 0 } as Record<string, number>
  );

  const completedWithOutcome = statusCounts.success + statusCounts.failed;
  const executionSuccessRate =
    completedWithOutcome > 0 ? (statusCounts.success / completedWithOutcome) * 100 : null;

  const totalCommandsRun = meta.totalCommandsRun ?? 0;
  const totalCommandsFailed = meta.totalCommandsFailed ?? 0;
  const commandSuccessRate =
    totalCommandsRun > 0
      ? ((totalCommandsRun - totalCommandsFailed) / totalCommandsRun) * 100
      : null;

  return (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Monthly Consumption
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {executionMinutesUsed.toFixed(2)}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  / {executionLimit} minutes
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Pending {statusCounts.pending}</Badge>
              <Badge variant="default">Running {statusCounts.running}</Badge>
              <Badge variant="success">Success {statusCounts.success}</Badge>
              <Badge variant="destructive">Failed {statusCounts.failed}</Badge>
              {(statusCounts.cancelled ?? 0) > 0 && (
                <Badge variant="outline">Cancelled {statusCounts.cancelled}</Badge>
              )}
              {executionSuccessRate != null && (
                <Badge variant="outline">
                  Execution success {executionSuccessRate.toFixed(0)}%
                </Badge>
              )}
              {commandSuccessRate != null && (
                <Badge variant="outline">
                  Command success {commandSuccessRate.toFixed(0)}%
                </Badge>
              )}
            </div>
            <Button onClick={() => void queueManualExecution()} disabled={queuing}>
              <Play className="mr-2 h-4 w-4" />
              {queuing ? "Queuing..." : "Run Manually"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {executions.length} total execution records
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadExecutions()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : executions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-4">
                <Clock className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No executions yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Run your first execution to see live status updates, logs, and metrics here.
            </p>
            <Button onClick={() => void queueManualExecution()} disabled={queuing}>
              <Play className="mr-2 h-4 w-4" />
              {queuing ? "Queuing..." : "Run your first execution"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {executions.map((ex) => (
            <Card key={ex.id} className="hover:border-border/80">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {statusIcon(ex.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{ex.repositoryName}</p>
                  <p className="text-sm text-muted-foreground">
                    {triggerLabel(ex.trigger)} ·{" "}
                    {ex.commandsRun > 0
                      ? `${ex.commandsPassed}/${ex.commandsRun} passed`
                      : ex.status === "running"
                      ? "Running..."
                      : "—"}
                    {ex.durationMs && ` · ${(ex.durationMs / 1000).toFixed(1)}s`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      ex.status === "success"
                        ? "success"
                        : ex.status === "failed"
                        ? "destructive"
                        : ex.status === "cancelled"
                        ? "secondary"
                        : ex.status === "running"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {ex.status}
                  </Badge>
                  <Link href={`/dashboard/executions/${ex.id}`}>
                    <Button variant="ghost" size="sm">
                      Logs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
