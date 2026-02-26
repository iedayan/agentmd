"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, DollarSign, Zap } from "lucide-react";
import { cn } from "@/lib/core/utils";

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bento-card border-luminescent group bg-gradient-to-br from-primary/[0.05] to-transparent p-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Execution Speed</CardTitle>
            <Zap className="h-5 w-5 text-primary group-hover:animate-pulse transition-all duration-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gradient">
              {loading ? "…" : `${(data?.impact.avgExecutionSeconds ?? 0).toFixed(1)}s`}
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-black mt-2 tracking-widest">LATENCY AGGREGATE</p>
            <div className="mt-5 h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-bright transition-all duration-1000 ease-out"
                style={{ width: `${loading ? 0 : Math.min(100, ((data?.impact.avgExecutionSeconds ?? 0) / 120) * 100)}%` }}
              />
            </div>
          </CardContent>
        </div>
        <div className="bento-card border-luminescent group bg-gradient-to-br from-emerald-500/[0.05] to-transparent p-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Time Saved</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500 transition-all duration-500 group-hover:scale-125" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-500 text-primary-glow">
              {loading ? "…" : `${data?.impact.automationHoursSaved ?? 0}`} <span className="text-sm font-black opacity-40 ml-1">HRS</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-black mt-2 tracking-widest uppercase">Efficiency Surplus</p>
          </CardContent>
        </div>
        <div className="bento-card border-luminescent bg-primary/[0.03] p-1 border-beam">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">ROI Multiple</CardTitle>
            <DollarSign className="h-5 w-5 text-primary animate-glow-pulse rounded-full p-0.5" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary text-primary-glow">
              {loading ? "…" : `${data?.kpis.roiMultiple ?? 1}x`}
            </div>
            <p className="text-[10px] text-primary/60 font-black mt-2 tracking-widest uppercase">Capital Efficiency</p>
          </CardContent>
        </div>
        <div className="bento-card border-luminescent group p-1 bg-gradient-to-br from-indigo-500/[0.05] to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Success Rate</CardTitle>
            <BarChart3 className="h-5 w-5 text-indigo-500 transition-all duration-500 group-hover:rotate-12" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gradient">
              {loading ? "…" : `${data?.impact.commandSuccessRate ?? 0}%`}
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-black mt-2 tracking-widest uppercase">Contract Compliance</p>
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
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-border/40 bg-background/40 p-6 relative group hover:border-emerald-500/40 transition-all duration-500 shadow-sm hover:shadow-glow/5">
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">Gross Value</p>
              <p className="text-3xl font-black text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                {loading ? "…" : `$${(roi?.value.grossValueUsd ?? 0).toLocaleString()}`}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/10 rounded-b-3xl" />
            </div>
            <div className="rounded-3xl border border-border/40 bg-background/40 p-6 hover:border-emerald-500/40 transition-all duration-500 shadow-sm hover:shadow-glow/5">
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">Net Value</p>
              <p className="text-3xl font-black text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                {loading ? "…" : `$${(roi?.value.netValueUsd ?? 0).toLocaleString()}`}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/10 rounded-b-3xl" />
            </div>
            <div className="rounded-3xl border border-border/40 bg-background/40 p-6 hover:border-indigo-500/40 transition-all duration-500 shadow-sm hover:shadow-glow/5">
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">Prevented Failures</p>
              <p className="text-3xl font-black text-indigo-500 drop-shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                {loading ? "…" : `${roi?.metrics.preventedFailures ?? 0}`}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500/10 rounded-b-3xl" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-glow-pulse" />
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.15em]">
              Confidence Index: <span className="text-foreground/80">{loading ? "…" : roi?.confidence ?? "n/a"}</span>
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
          <div className="rounded-2xl border border-border/40 p-6 bg-background/40 backdrop-blur-sm">
            {loading ? (
              <div className="grid h-48 grid-cols-14 gap-2">
                {Array.from({ length: 14 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-full bg-muted/40" />
                ))}
              </div>
            ) : (
              <div className="grid h-48 grid-cols-14 gap-2.5 items-end">
                {(data?.trend ?? []).map((point, idx) => (
                  <div
                    key={point.date}
                    className="group relative flex flex-col items-center justify-end h-full w-full"
                    title={`${point.date}: ${point.executions} runs, ${point.failedExecutions} failed`}
                  >
                    <div
                      className={cn(
                        "w-full rounded-full transition-all duration-500 group-hover:scale-x-125 group-hover:shadow-glow/10",
                        point.failedExecutions > 0 ? "bg-gradient-to-t from-red-500/40 to-red-400/60" : "bg-gradient-to-t from-primary/60 to-primary-bright/80"
                      )}
                      style={{
                        height: `${Math.max(8, (point.executions / maxExecutions) * 100)}%`,
                      }}
                    />
                    <div className="absolute -top-8 bg-card border border-border/50 rounded-md px-2 py-1 text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                      {point.executions} RUNS
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground/40 mt-3 group-hover:text-primary transition-colors">
                      {point.date.slice(5).replace('-', '/')}
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
