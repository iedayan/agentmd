"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
        <div className="bento-card border-luminescent group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Execution Minutes</CardTitle>
            <Zap className="h-4 w-4 text-primary group-hover:animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gradient">
              {loading ? "…" : `${(data?.impact.avgExecutionSeconds ?? 0).toFixed(1)}s`}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">LATENCY AGGREGATE</p>
            <div className="mt-4 h-1 w-full bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${loading ? 0 : Math.min(100, ((data?.impact.avgExecutionSeconds ?? 0) / 120) * 100)}%` }}
              />
            </div>
          </CardContent>
        </div>
        <div className="bento-card border-luminescent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Time Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-500 text-primary-glow">
              {loading ? "…" : `${data?.impact.automationHoursSaved ?? 0}`} <span className="text-sm font-bold opacity-60">HRS</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">EFFICIENCY SURPLUS</p>
          </CardContent>
        </div>
        <div className="bento-card border-luminescent bg-primary/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary/80">ROI Multiple</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary text-primary-glow">
              {loading ? "…" : `${data?.kpis.roiMultiple ?? 1}x`}
            </div>
            <p className="text-[10px] text-primary/60 font-medium mt-1">CAPITAL EFFICIENCY</p>
          </CardContent>
        </div>
        <div className="bento-card border-luminescent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gradient">
              {loading ? "…" : `${data?.impact.commandSuccessRate ?? 0}%`}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">CONTRACT COMPLIANCE</p>
          </CardContent>
        </div>
      </div>

      <div className="bento-card border-luminescent bg-emerald-500/[0.02]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Hard ROI Proof</CardTitle>
              <CardDescription className="text-xs">
                Quantified economic value from automation and failure prevention.
              </CardDescription>
            </div>
            <Link href="/docs/roi-methodology">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Methodology ↗</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/40 bg-background/50 p-4 relative group hover:border-emerald-500/30 transition-colors">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Gross Value</p>
              <p className="text-2xl font-black text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                {loading ? "…" : `$${(roi?.value.grossValueUsd ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background/50 p-4 hover:border-emerald-500/30 transition-colors">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Net Value</p>
              <p className="text-2xl font-black text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                {loading ? "…" : `$${(roi?.value.netValueUsd ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background/50 p-4 hover:border-emerald-500/30 transition-colors">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Prevented Failures</p>
              <p className="text-2xl font-black text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]">
                {loading ? "…" : `${roi?.metrics.preventedFailures ?? 0}`}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
              Confidence Index: {loading ? "…" : roi?.confidence ?? "n/a"}
            </p>
          </div>
        </CardContent>
      </div>

      <div className="bento-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Contract Validation</CardTitle>
          <CardDescription className="text-xs">
            Pass/fail rates by output contract type (30d).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="rounded-xl border border-border/40 p-3 bg-muted/20">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Total checks</p>
              <p className="text-xl font-black">{loading ? "…" : contracts?.totals.total ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border/40 p-3 bg-muted/20">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Pass rate</p>
              <p className="text-xl font-black text-emerald-500">{loading ? "…" : `${contracts?.totals.passRate ?? 0}%`}</p>
            </div>
            <div className="rounded-xl border border-border/40 p-3 bg-muted/20">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Failed</p>
              <p className="text-xl font-black text-red-500">{loading ? "…" : contracts?.totals.failed ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border/40 p-3 bg-muted/20">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Pending</p>
              <p className="text-xl font-black text-primary">{loading ? "…" : contracts?.totals.pending ?? 0}</p>
            </div>
          </div>
          <div className="space-y-3">
            {(contracts?.byType ?? []).slice(0, 6).map((item) => (
              <div key={item.contractType} className="rounded-2xl border border-border/40 p-4 bg-background/50 group hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm text-foreground/80">{item.contractType}</p>
                  <p className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full">{item.total} INSIGHTS</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${item.passRate}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-black w-8">{item.passRate}%</p>
                </div>
              </div>
            ))}
            {!loading && (contracts?.byType.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No contract checks recorded yet.</p>
            ) : null}
          </div>
        </CardContent>
      </div>

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
