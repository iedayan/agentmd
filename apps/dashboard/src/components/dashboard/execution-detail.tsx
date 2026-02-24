"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";
import type { Execution, ExecutionStep } from "@/types";
import { getPlan } from "@/lib/billing/plans";

export function ExecutionDetail({ executionId }: { executionId: string }) {
  const id = executionId || "1";
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [execution, setExecution] = useState<Execution | null>(null);
  const [monthlyMinutesUsed, setMonthlyMinutesUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const executionLimit = getPlan("free").executionMinutes;

  const loadExecution = useCallback(async () => {
    try {
      const [executionRes, metaRes] = await Promise.all([
        fetch(`/api/executions/${id}`, { cache: "no-store" }),
        fetch("/api/executions?limit=1", { cache: "no-store" }),
      ]);

      if (executionRes.status === 404) {
        setNotFound(true);
        setExecution(null);
        setSteps([]);
        return;
      }

      const executionData = (await executionRes.json()) as {
        ok?: boolean;
        execution?: Execution;
        steps?: ExecutionStep[];
        error?: string;
      };
      if (!executionRes.ok || executionData.ok === false) {
        throw new Error(executionData.error ?? "Failed to load execution details.");
      }

      const metaData = (await metaRes.json()) as {
        ok?: boolean;
        meta?: { executionMinutesUsed?: number };
      };

      setExecution(executionData.execution ?? null);
      setSteps(executionData.steps ?? []);
      setMonthlyMinutesUsed(metaData.meta?.executionMinutesUsed ?? 0);
      setNotFound(false);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load execution details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    void loadExecution();
  }, [loadExecution]);

  useEffect(() => {
    if (notFound) return;
    if (execution?.status !== "pending" && execution?.status !== "running") return;
    const intervalId = setInterval(() => {
      void loadExecution();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [execution?.status, loadExecution, notFound]);

  const [cancelling, setCancelling] = useState(false);
  const cancelExecution = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/executions/${id}/cancel`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "Failed to cancel");
      }
      await loadExecution();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel execution");
    } finally {
      setCancelling(false);
    }
  };

  if (!loading && notFound) {
    return (
      <div className="space-y-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/executions" className="hover:text-foreground transition-colors">
            Executions
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span className="font-medium text-foreground">Execution {id}</span>
        </nav>
        <h1 className="text-2xl font-bold">Execution not found</h1>
        <p className="text-muted-foreground">
          The requested execution id does not exist.
        </p>
      </div>
    );
  }

  const durationSeconds = execution?.durationMs
    ? (execution.durationMs / 1000).toFixed(1)
    : "0.0";
  const executionMinutes = execution?.durationMs
    ? (execution.durationMs / 60000).toFixed(2)
    : "0.00";
  const completedSteps = useMemo(
    () => steps.filter((step) => step.status === "success").length,
    [steps]
  );

  const exportLogs = () => {
    if (!steps.length) return;
    const header = ["stepId", "command", "type", "status", "durationMs", "outputOrError"];
    const rows = steps.map((step) => [
      step.id,
      step.command,
      step.type,
      step.status,
      String(step.durationMs ?? ""),
      step.error ?? step.output ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execution-${id}-logs.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/executions" className="hover:text-foreground transition-colors">
          Executions
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-medium text-foreground">Execution {id}</span>
      </nav>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Execution {id}</h1>
          <p className="text-muted-foreground">
            {execution?.repositoryName ?? "Unknown repository"} ·{" "}
            {execution?.trigger ?? "unknown"} · {durationSeconds}s
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">Steps {steps.length}</Badge>
            <Badge variant="success">Completed {completedSteps}</Badge>
            <Badge
              variant={
                execution?.status === "failed"
                  ? "destructive"
                  : execution?.status === "cancelled"
                    ? "secondary"
                    : "default"
              }
            >
              {execution?.status ?? "pending"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {(execution?.status === "pending" || execution?.status === "running") && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => void cancelExecution()}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </Button>
          )}
          <Button variant="outline" onClick={exportLogs} disabled={!steps.length}>
            Export Logs
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => void loadExecution()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            Each step from AGENTS.md commands
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 h-12 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : steps.length === 0 ? (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
              No execution steps were recorded for this run.
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  className={`relative flex items-start gap-4 rounded-lg border p-4 ${
                    step.status === "running" ? "border-primary/60 bg-primary/5" : ""
                  }`}
                >
                  {i < steps.length - 1 ? (
                    <div className="absolute left-[31px] top-12 h-8 w-px bg-border/80" />
                  ) : null}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {step.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : step.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-sm font-medium">{step.command}</code>
                      <Badge variant="secondary">{step.type}</Badge>
                      <Badge
                        variant={
                          step.status === "success"
                            ? "success"
                            : step.status === "failed"
                            ? "destructive"
                            : step.status === "running"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {step.status}
                      </Badge>
                      {step.durationMs && (
                        <span className="text-xs text-muted-foreground">
                          {(step.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    {(step.output || step.error) && (
                      <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">
                        {step.error ?? step.output}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compute time this run
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Execution minutes</span>
            <span className="font-mono">{executionMinutes} min</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Monthly used</span>
            <span className="font-mono">
              {monthlyMinutesUsed.toFixed(2)} / {executionLimit} min
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
