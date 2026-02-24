"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, DollarSign, Zap } from "lucide-react";

type AnalyticsOverview = {
  impact: {
    automationHoursSaved: number;
    commandSuccessRate: number;
    executionFailureRate: number;
    avgExecutionSeconds: number;
    completedExecutions: number;
  };
  trend: {
    date: string;
    executions: number;
    failedExecutions: number;
    commandsRun: number;
    commandsFailed: number;
  }[];
  kpis: {
    failurePreventionEstimate: number;
    roiMultiple: number;
    repositories: number;
  };
};

type RoiReport = {
  confidence: "low" | "medium" | "high";
  value: {
    grossValueUsd: number;
    netValueUsd: number;
    roiMultiple: number;
  };
  metrics: {
    preventedFailures: number;
  };
};

type ContractAnalytics = {
  totals: {
    total: number;
    success: number;
    failed: number;
    pending: number;
    passRate: number;
  };
  byType: Array<{
    contractType: string;
    total: number;
    success: number;
    failed: number;
    pending: number;
    passRate: number;
  }>;
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [roi, setRoi] = useState<RoiReport | null>(null);
  const [contracts, setContracts] = useState<ContractAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [overviewRes, roiRes, contractsRes] = await Promise.all([
          fetch("/api/analytics/overview", { cache: "no-store" }),
          fetch("/api/analytics/roi-report", { cache: "no-store" }),
          fetch("/api/analytics/contracts?days=30", { cache: "no-store" }),
        ]);
        const body = (await overviewRes.json()) as {
          ok?: boolean;
          error?: string;
        } & Partial<AnalyticsOverview>;
        const roiBody = (await roiRes.json()) as {
          ok?: boolean;
          error?: string;
        } & Partial<RoiReport>;
        const contractsBody = (await contractsRes.json()) as {
          ok?: boolean;
          error?: string;
        } & Partial<ContractAnalytics>;
        if (!overviewRes.ok || body.ok === false) {
          throw new Error(body.error ?? "Failed to load analytics.");
        }
        if (!roiRes.ok || roiBody.ok === false) {
          throw new Error(roiBody.error ?? "Failed to load ROI report.");
        }
        if (!contractsRes.ok || contractsBody.ok === false) {
          throw new Error(contractsBody.error ?? "Failed to load contract analytics.");
        }
        if (!cancelled) {
          setData(body as AnalyticsOverview);
          setRoi(roiBody as RoiReport);
          setContracts(contractsBody as ContractAnalytics);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load analytics.");
          setData(null);
          setRoi(null);
          setContracts(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxExecutions = useMemo(
    () => Math.max(1, ...(data?.trend.map((point) => point.executions) ?? [1])),
    [data]
  );

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Execution Minutes</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "…" : `${(data?.impact.avgExecutionSeconds ?? 0).toFixed(1)}s avg`}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
            <Progress
              value={
                loading
                  ? 0
                  : Math.min(
                      100,
                      ((data?.impact.avgExecutionSeconds ?? 0) / 120) * 100
                    )
              }
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "…" : `~${data?.impact.automationHoursSaved ?? 0} hrs`}
            </div>
            <p className="text-xs text-muted-foreground">vs manual runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROI Estimate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "…" : `${data?.kpis.roiMultiple ?? 1}x`}</div>
              <p className="text-xs text-muted-foreground">Time saved vs cost</p>
            </CardContent>
          </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "…" : `${data?.impact.commandSuccessRate ?? 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hard ROI Proof (30 days)</CardTitle>
          <CardDescription>
            Quantified economic value from automation and failure prevention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">Gross Value</p>
              <p className="text-lg font-semibold">
                {loading ? "…" : `$${(roi?.value.grossValueUsd ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">Net Value</p>
              <p className="text-lg font-semibold">
                {loading ? "…" : `$${(roi?.value.netValueUsd ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">Prevented Failures</p>
              <p className="text-lg font-semibold">
                {loading ? "…" : `${roi?.metrics.preventedFailures ?? 0}`}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Confidence: {loading ? "…" : roi?.confidence ?? "n/a"}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Validation (30 days)</CardTitle>
          <CardDescription>
            Pass/fail rates by output contract type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">Total checks</p>
              <p className="text-lg font-semibold">{loading ? "…" : contracts?.totals.total ?? 0}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">Pass rate</p>
              <p className="text-lg font-semibold">{loading ? "…" : `${contracts?.totals.passRate ?? 0}%`}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">Failed</p>
              <p className="text-lg font-semibold">{loading ? "…" : contracts?.totals.failed ?? 0}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">Pending</p>
              <p className="text-lg font-semibold">{loading ? "…" : contracts?.totals.pending ?? 0}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(contracts?.byType ?? []).slice(0, 6).map((item) => (
              <div key={item.contractType} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.contractType}</p>
                  <p className="text-sm text-muted-foreground">{item.total} checks</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pass rate {item.passRate}% · Failed {item.failed} · Pending {item.pending}
                </p>
              </div>
            ))}
            {!loading && (contracts?.byType.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No contract checks recorded yet.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend Dashboard (14 days)</CardTitle>
          <CardDescription>
            Execution volume and failures by day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4">
            {loading ? (
              <div className="grid h-40 grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded bg-muted/50" />
                ))}
              </div>
            ) : (
              <div className="grid h-40 grid-cols-7 gap-2">
                {(data?.trend ?? []).map((point) => (
                  <div
                    key={point.date}
                    className="flex flex-col items-center justify-end gap-1"
                    title={`${point.date}: ${point.executions} runs, ${point.failedExecutions} failed`}
                  >
                    <div
                      className="w-full rounded bg-primary/70"
                      style={{
                        height: `${Math.max(10, (point.executions / maxExecutions) * 100)}%`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {point.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-md border p-3">
              <p className="font-medium">Failure prevention estimate</p>
              <p className="text-muted-foreground">
                {loading ? "…" : `${data?.kpis.failurePreventionEstimate ?? 0} potential failures prevented`}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="font-medium">Repository coverage</p>
              <p className="text-muted-foreground">
                {loading ? "…" : `${data?.kpis.repositories ?? 0} active repositories tracked`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
