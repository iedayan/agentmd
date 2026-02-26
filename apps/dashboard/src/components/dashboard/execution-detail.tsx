"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertTriangle,
  Copy,
  Download,
  Check,
} from "lucide-react";
import type { Execution, ExecutionStep } from "@/types";
import { getPlan } from "@/lib/billing/plans";
import { cn } from "@/lib/core/utils";

type PreflightReasonDetail = { code?: string; message?: string };
type PreflightPlanItem = {
  command?: unknown;
  type?: unknown;
  section?: unknown;
  line?: unknown;
  runnable?: unknown;
  reasons?: unknown;
  reasonDetails?: unknown;
  requiresShell?: unknown;
  requiresApproval?: unknown;
};
type PreflightPlan = {
  runnableCount?: number;
  blockedCount?: number;
  items?: unknown;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? (value.filter((v) => typeof v === "string") as string[])
    : [];
}

function getFixSuggestion(
  code: string,
  command?: string
): { description: string; snippet: string; link?: string; linkLabel?: string } | null {
  const cmd = command || "<command>";
  switch (code) {
    case "PERMISSION_DENIED":
      return {
        description: "Add this command to the shell allowlist in your AGENTS.md frontmatter:",
        snippet: `permissions:
  shell:
    allow:
      - "${cmd}"
    default: deny`,
      };
    case "APPROVAL_REQUIRED":
      return {
        description: "This command requires human approval. Approve it in the Approvals page, or add the pattern to allowlist:",
        snippet: `# In policy: requireApprovalForPatterns
# Add to allowlist or approve at dashboard/approvals`,
        link: "/dashboard/approvals",
        linkLabel: "View approvals",
      };
    case "REQUIRES_SHELL":
      return {
        description: "This command requires shell features (pipes, redirection). Rerun with --use-shell or add to AGENTS.md:",
        snippet: `# CLI: agentmd run . --use-shell

# Or in AGENTS.md, document that shell is required for this section.`,
      };
    case "UNSAFE":
      return {
        description: "This command matches dangerous patterns. Remove or replace it. Do not add to allowlist.",
        snippet: `# Remove or replace the command.
# Common unsafe patterns: rm -rf /, sudo, curl | sh, eval`,
      };
    default:
      return null;
  }
}

function asReasonDetails(value: unknown): Array<{ code: string; message: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => v && typeof v === "object")
    .map((v) => v as PreflightReasonDetail)
    .filter((v) => typeof v.code === "string" && typeof v.message === "string")
    .map((v) => ({ code: v.code as string, message: v.message as string }));
}

function normalizePreflightPlan(value: unknown): {
  runnableCount: number;
  blockedCount: number;
  items: Array<{
    command: string;
    type: string;
    section: string;
    line?: number;
    runnable: boolean;
    reasons: string[];
    reasonDetails: Array<{ code: string; message: string }>;
    requiresShell: boolean;
    requiresApproval: boolean;
  }>;
} | null {
  if (!value || typeof value !== "object") return null;
  const plan = value as PreflightPlan;
  const rawItems = Array.isArray(plan.items) ? (plan.items as PreflightPlanItem[]) : [];

  const items = rawItems.map((item) => {
    const runnable = Boolean(item?.runnable);
    return {
      command: typeof item?.command === "string" ? item.command : "",
      type: typeof item?.type === "string" ? item.type : "",
      section: typeof item?.section === "string" ? item.section : "",
      line: typeof item?.line === "number" ? item.line : undefined,
      runnable,
      reasons: asStringArray(item?.reasons),
      reasonDetails: asReasonDetails(item?.reasonDetails),
      requiresShell: Boolean(item?.requiresShell),
      requiresApproval: Boolean(item?.requiresApproval),
    };
  });

  const runnableCount =
    typeof plan.runnableCount === "number"
      ? plan.runnableCount
      : items.filter((i) => i.runnable).length;
  const blockedCount =
    typeof plan.blockedCount === "number"
      ? plan.blockedCount
      : items.filter((i) => !i.runnable).length;

  return { runnableCount, blockedCount, items };
}

export function ExecutionDetail({ executionId }: { executionId: string }) {
  const id = executionId || "1";
  const router = useRouter();
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [execution, setExecution] = useState<Execution | null>(null);
  const [monthlyMinutesUsed, setMonthlyMinutesUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPreflight, setCopiedPreflight] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [blockedSearch, setBlockedSearch] = useState("");
  const [blockedCodeFilter, setBlockedCodeFilter] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
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
          <BackLink href="/dashboard/executions">Executions</BackLink>
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

  const preflight = useMemo(() => {
    if (execution?.blockedCommands && Array.isArray(execution.blockedCommands)) {
      const runnableCount = execution.preflightRunnableCount ?? 0;
      const blockedCount = execution.preflightBlockedCount ?? execution.blockedCommands.length;
      const items = execution.blockedCommands.map((bc) => ({
        command: bc.command,
        type: bc.type,
        section: bc.section,
        line: bc.line,
        runnable: false,
        reasons: bc.messages,
        reasonDetails: bc.codes.map((code, i) => ({
          code,
          message: bc.messages[i] ?? bc.messages[0] ?? "Blocked",
        })),
        requiresShell: bc.requiresShell,
        requiresApproval: bc.requiresApproval,
      }));
      return { runnableCount, blockedCount, items };
    }
    return normalizePreflightPlan(execution?.preflightPlan);
  }, [execution?.preflightPlan, execution?.blockedCommands, execution?.preflightRunnableCount, execution?.preflightBlockedCount]);

  const preflightJson = useMemo(() => {
    if (!execution?.preflightPlan) return null;
    try {
      return JSON.stringify(execution.preflightPlan, null, 2);
    } catch {
      return null;
    }
  }, [execution?.preflightPlan]);

  const copyPreflight = async () => {
    if (!preflightJson) return;
    await navigator.clipboard.writeText(preflightJson);
    setCopiedPreflight(true);
    setTimeout(() => setCopiedPreflight(false), 1500);
  };

  const downloadPreflight = () => {
    if (!preflightJson) return;
    const blob = new Blob([preflightJson], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execution-${id}-preflight.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const blockedItems = useMemo(() => {
    if (!preflight) {
      return [] as Array<{
        command: string;
        type: string;
        section: string;
        line?: number;
        runnable: boolean;
        reasons: string[];
        reasonDetails: Array<{ code: string; message: string }>;
        requiresShell: boolean;
        requiresApproval: boolean;
        codes: string[];
      }>;
    }

    return preflight.items
      .filter((i) => !i.runnable)
      .map((i) => {
        const codes =
          i.reasonDetails.length > 0
            ? Array.from(new Set(i.reasonDetails.map((d) => d.code)))
            : ["UNKNOWN"];
        return { ...i, codes };
      });
  }, [preflight]);

  const filteredBlockedItems = useMemo(() => {
    const q = blockedSearch.trim().toLowerCase();
    return blockedItems.filter((item) => {
      if (blockedCodeFilter && !item.codes.includes(blockedCodeFilter)) {
        return false;
      }
      if (!q) return true;
      const haystack = [item.command, item.type, item.section, ...item.reasons]
        .join("\n")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [blockedItems, blockedCodeFilter, blockedSearch]);

  const copyCommandToClipboard = async (command: string) => {
    if (!command) return;
    await navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 1500);
  };

  const blockedByCode = useMemo(() => {
    if (!preflight) return [] as Array<{ code: string; count: number; messages: string[]; sampleCommand?: string }>;

    const map = new Map<string, { count: number; messages: Set<string>; sampleCommand?: string }>();
    for (const item of preflight.items.filter((i) => !i.runnable)) {
      const details = item.reasonDetails;
      if (details.length === 0) {
        const entry = map.get("UNKNOWN") ?? { count: 0, messages: new Set<string>() };
        entry.count += 1;
        for (const message of item.reasons) entry.messages.add(message);
        if (!entry.sampleCommand && item.command) entry.sampleCommand = item.command;
        map.set("UNKNOWN", entry);
        continue;
      }

      const codes = new Set(details.map((d) => d.code));
      for (const code of codes) {
        const entry = map.get(code) ?? { count: 0, messages: new Set<string>() };
        entry.count += 1;
        for (const d of details.filter((d) => d.code === code)) entry.messages.add(d.message);
        if (!entry.sampleCommand && item.command) entry.sampleCommand = item.command;
        map.set(code, entry);
      }
    }

    return Array.from(map.entries())
      .map(([code, value]) => ({
        code,
        count: value.count,
        messages: Array.from(value.messages).slice(0, 6),
        sampleCommand: value.sampleCommand,
      }))
      .sort((a, b) => b.count - a.count);
  }, [preflight]);
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
    <div className="space-y-8 max-w-5xl mx-auto">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
        <BackLink href="/dashboard/executions">Executions</BackLink>
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
            {execution?.executionMode && (
              <Badge variant="outline" title={execution.executionMode === "real" ? "Commands ran in worker (AGENTMD_REAL_EXECUTION=1)" : "Simulated execution (default)"}>
                {execution.executionMode === "real" ? "Real execution" : "Mock execution"}
              </Badge>
            )}
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

          {execution?.agentsMdUrl ? (
            <Button
              variant="outline"
              onClick={async () => {
                if (!execution?.agentsMdUrl) return;
                setRerunning(true);
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
                      repositoryId: execution.repositoryId,
                      agentsMdUrl: execution.agentsMdUrl,
                    }),
                  });
                  const data = (await response.json().catch(() => ({}))) as {
                    ok?: boolean;
                    error?: string;
                    dashboardExecution?: { id?: string };
                  };
                  if (!response.ok || data.ok === false) {
                    throw new Error(data.error ?? "Failed to rerun execution");
                  }
                  const nextId = data.dashboardExecution?.id;
                  if (typeof nextId === "string" && nextId.length > 0) {
                    router.push(`/dashboard/executions/${nextId}`);
                    return;
                  }
                  await loadExecution();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to rerun execution");
                } finally {
                  setRerunning(false);
                }
              }}
              disabled={rerunning}
            >
              {rerunning ? "Rerunning..." : "Rerun"}
            </Button>
          ) : null}

          <Button variant="outline" onClick={exportLogs} disabled={!steps.length}>
            Export Logs
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 border-luminescent overflow-hidden">
          <CardContent className="py-4">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button size="sm" variant="outline" className="mt-3 btn-tactile" onClick={() => void loadExecution()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bento-card">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                  Timeline
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Each step from AGENTS.md commands
                </p>
              </div>
              {steps.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {steps.map((step, i) => (
                    <span key={step.id} className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={cn(
                          "rounded-lg px-2 py-1 text-xs font-mono",
                          step.status === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : step.status === "failed" || step.status === "blocked"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : step.status === "running"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        )}
                      >
                        {step.type || "cmd"}
                      </span>
                      {i < steps.length - 1 && (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden />
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
              <div className="rounded-3xl border-2 border-dashed p-12 text-center text-sm text-muted-foreground">
                No execution steps were recorded for this run.
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div
                    key={step.id}
                    className={`relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 ${step.status === "running"
                        ? "border-primary/40 bg-primary/5 shadow-glow animate-thought-pulse ring-1 ring-primary/20"
                        : "border-border hover:border-primary/20 bg-card/30"
                      }`}
                  >
                    {i < steps.length - 1 ? (
                      <div className="absolute left-[35px] top-14 h-6 w-px bg-border/40" />
                    ) : null}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${step.status === "running" ? "bg-primary/20 border-primary/40" : "bg-muted/50 border-border"
                      }`}>
                      {step.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : step.status === "failed" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : step.status === "blocked" ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      ) : step.status === "running" ? (
                        <div className="relative">
                          <ChevronRight className="h-5 w-5 text-primary animate-pulse" />
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        </div>
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <code className="text-sm font-mono font-medium text-foreground/90">{step.command}</code>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="font-normal">{step.type}</Badge>
                          <Badge
                            variant={
                              step.status === "success"
                                ? "success"
                                : step.status === "failed"
                                  ? "destructive"
                                  : step.status === "blocked"
                                    ? "warning"
                                    : step.status === "running"
                                      ? "default"
                                      : "secondary"
                            }
                            className={step.status === "running" ? "animate-pulse" : ""}
                          >
                            {step.status === "running" ? "thinking..." : step.status}
                          </Badge>
                          {step.status === "blocked" && step.reasonDetails?.length ? (
                            <>
                              {Array.from(
                                new Set(step.reasonDetails.map((d) => d.code))
                              ).map((code) => (
                                <Badge key={code} variant="outline">
                                  {code}
                                </Badge>
                              ))}
                            </>
                          ) : null}
                        </div>
                        {step.durationMs && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {(step.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                      {(step.output || step.error || (step.reasons && step.reasons.length > 0)) && (
                        <div className="mt-3 relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-transparent rounded opacity-0 group-hover:opacity-100 transition duration-300" />
                          <div className="relative overflow-x-auto rounded-xl bg-muted/50 border border-border/50 p-4 text-xs font-mono text-muted-foreground leading-relaxed space-y-3">
                            {step.reasons && step.reasons.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1">
                                {step.reasons.map((reason) => (
                                  <li key={reason}>{reason}</li>
                                ))}
                              </ul>
                            ) : null}
                            {step.error || step.output ? (
                              <pre className="whitespace-pre-wrap">{step.error ?? step.output}</pre>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {preflight && (
            <Card className="bento-card border-border/70">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Preflight Summary</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      What was runnable vs blocked before execution
                    </p>
                  </div>
                  {preflightJson ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void copyPreflight()}
                        className="h-9"
                        aria-label={copiedPreflight ? "Copied" : "Copy preflight JSON"}
                      >
                        {copiedPreflight ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadPreflight}
                        className="h-9"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Runnable {preflight.runnableCount}</Badge>
                  <Badge variant={preflight.blockedCount > 0 ? "warning" : "secondary"}>
                    Blocked {preflight.blockedCount}
                  </Badge>
                </div>

                {blockedByCode.length > 0 ? (
                  <div className="space-y-3">
                    {blockedByCode.map((row) => {
                      const fix = getFixSuggestion(row.code, row.sampleCommand);
                      return (
                        <div
                          key={row.code}
                          className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <Badge variant="outline">{row.code}</Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {row.count} blocked
                            </span>
                          </div>
                          {row.messages.length > 0 ? (
                            <ul className="mt-3 list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                              {row.messages.map((m) => (
                                <li key={m}>{m}</li>
                              ))}
                            </ul>
                          ) : null}
                          {fix ? (
                            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
                              <p className="text-xs font-medium text-foreground mb-2">Fix suggestion</p>
                              <p className="text-xs text-muted-foreground mb-2">{fix.description}</p>
                              <div className="relative group">
                                <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto">
                                  {fix.snippet}
                                </pre>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="absolute top-1 right-1 h-7 opacity-70 group-hover:opacity-100"
                                  onClick={() => void navigator.clipboard.writeText(fix.snippet)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              {fix.link ? (
                                <Link
                                  href={fix.link}
                                  className="mt-2 inline-block text-xs text-primary hover:underline"
                                >
                                  {fix.linkLabel} →
                                </Link>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}

                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        Tip: use the table below to copy blocked commands and jump to relevant settings.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No blocked commands were reported by preflight.
                  </p>
                )}

                {preflight.blockedCount > 0 ? (
                  <div className="pt-2 space-y-3">
                    <div className="flex flex-col gap-2">
                      <Input
                        value={blockedSearch}
                        onChange={(e) => setBlockedSearch(e.target.value)}
                        placeholder="Search blocked commands, sections, or reasons…"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={blockedCodeFilter === null ? "default" : "outline"}
                          onClick={() => setBlockedCodeFilter(null)}
                        >
                          All
                        </Button>
                        {blockedByCode.map((row) => (
                          <Button
                            key={row.code}
                            size="sm"
                            variant={blockedCodeFilter === row.code ? "default" : "outline"}
                            onClick={() => setBlockedCodeFilter(row.code)}
                          >
                            {row.code}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted/30 px-4 py-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        <div className="col-span-7">Command</div>
                        <div className="col-span-3">Why</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      <div className="divide-y divide-border/60">
                        {filteredBlockedItems.length === 0 ? (
                          <div className="px-4 py-4 text-xs text-muted-foreground">
                            No blocked commands match your filters.
                          </div>
                        ) : (
                          filteredBlockedItems.map((item, idx) => {
                            const primaryCode = item.codes[0] ?? "UNKNOWN";
                            const primaryMessage =
                              item.reasonDetails.find((d: { code: string; message: string }) => d.code === primaryCode)?.message ??
                              item.reasons[0] ??
                              "Blocked";

                            return (
                              <div
                                key={`${item.command}-${item.line ?? idx}`}
                                className="grid grid-cols-12 gap-2 px-4 py-3 items-start"
                              >
                                <div className="col-span-7 min-w-0">
                                  <code className="block text-xs font-mono text-foreground/90 break-words">
                                    {item.command || "(unknown command)"}
                                  </code>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    {item.type ? (
                                      <Badge variant="secondary" className="font-normal">
                                        {item.type}
                                      </Badge>
                                    ) : null}
                                    {item.requiresShell ? (
                                      <Badge variant="outline">requires shell</Badge>
                                    ) : null}
                                    {item.requiresApproval ? (
                                      <Badge variant="outline">approval required</Badge>
                                    ) : null}
                                  </div>
                                  {item.section ? (
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                      Section: {item.section}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="col-span-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.codes.map((code: string) => (
                                      <Badge key={code} variant="outline">
                                        {code}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                    {primaryMessage}
                                  </p>
                                  {primaryCode === "PERMISSION_DENIED" ? (
                                    <Link
                                      href="/dashboard/enterprise/policies"
                                      className="mt-2 inline-block text-[11px] text-primary hover:underline"
                                    >
                                      Review policies →
                                    </Link>
                                  ) : null}
                                  {primaryCode === "REQUIRES_SHELL" ? (
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                      Hint: rerun with <code className="font-mono">--use-shell</code>.
                                    </p>
                                  ) : null}
                                </div>
                                <div className="col-span-2 flex justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void copyCommandToClipboard(item.command)}
                                    disabled={!item.command}
                                  >
                                    {copiedCommand === item.command ? (
                                      <>
                                        <Check className="h-4 w-4 mr-2 text-primary" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          <Card className="bento-card border-luminescent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cost & Compute</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compute time this run
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</span>
                  <span className="font-mono text-sm font-bold">{executionMinutes} min</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (monthlyMinutesUsed / executionLimit) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-muted-foreground">Monthly total</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {monthlyMinutesUsed.toFixed(2)} / {executionLimit}m
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bento-card bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Auto-Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AgentMD identified 2 optimizations to reduce execution time by ~1.2s.
              </p>
              <Button size="sm" variant="outline" className="w-full mt-4 text-xs h-8 border-primary/20 hover:bg-primary/10 transition-colors">
                Apply Suggestions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
