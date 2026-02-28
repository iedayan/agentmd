'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Gauge, Rocket, ShieldCheck, Timer } from 'lucide-react';
import type { Repository } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildImpactMetrics, type ImpactMetrics } from '@/lib/analytics/impact';

export function ImpactPanel({ repositories }: { repositories: Repository[] }) {
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const fallback = useMemo(() => buildImpactMetrics(repositories, [], 0, 0), [repositories]);
  const repositorySignature = useMemo(
    () =>
      repositories
        .map((repo) =>
          [
            repo.id,
            repo.healthScore,
            repo.lastValidated ?? '',
            repo.latestExecutionId ?? '',
            repo.latestExecutionStatus ?? '',
          ].join(':'),
        )
        .join('|'),
    [repositories],
  );

  useEffect(() => {
    let cancelled = false;
    const loadImpact = async () => {
      try {
        const res = await fetch('/api/impact', { cache: 'no-store' });
        const data = (await res.json()) as {
          ok?: boolean;
          impact?: ImpactMetrics;
          error?: string;
        };
        if (!res.ok || data.ok === false || !data.impact) {
          throw new Error(data.error ?? 'Failed to load impact metrics.');
        }
        if (!cancelled) {
          setImpact(data.impact);
          setApiUnavailable(false);
        }
      } catch {
        if (!cancelled) {
          setImpact(null);
          setApiUnavailable(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void loadImpact();
    return () => {
      cancelled = true;
    };
  }, [repositorySignature]);

  const value = impact ?? fallback;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Operational Impact</CardTitle>
            <CardDescription>Outcome metrics from execution and readiness signals.</CardDescription>
          </div>
          <Badge
            variant={
              value.stabilityScore >= 85
                ? 'success'
                : value.stabilityScore >= 70
                  ? 'warning'
                  : 'destructive'
            }
          >
            Stability {value.stabilityScore}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiUnavailable ? (
          <p className="text-xs text-muted-foreground">
            Live impact API unavailable. Showing local estimate.
          </p>
        ) : null}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={<Rocket className="h-4 w-4 text-primary" />}
              label="Hours Saved"
              value={`${value.automationHoursSaved}h`}
              sub={`${value.completedExecutions} completed runs`}
            />
            <Metric
              icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
              label="Command Success"
              value={`${value.commandSuccessRate}%`}
              sub="Across completed executions"
            />
            <Metric
              icon={<Gauge className="h-4 w-4 text-amber-500" />}
              label="Execution Failure"
              value={`${value.executionFailureRate}%`}
              sub="Lower is better"
            />
            <Metric
              icon={<Timer className="h-4 w-4 text-cyan-500" />}
              label="Avg Runtime"
              value={`${value.avgExecutionSeconds}s`}
              sub="Per completed execution"
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground">{value.summary}</p>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
