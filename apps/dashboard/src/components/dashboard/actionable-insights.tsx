'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Rocket, ShieldAlert } from 'lucide-react';
import type { Repository } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildInsights, type Insight, type InsightPriority } from '@/lib/analytics/insights';

function priorityStyles(priority: InsightPriority) {
  if (priority === 'high') {
    return { badge: 'destructive' as const, label: 'High priority' };
  }
  if (priority === 'medium') {
    return { badge: 'warning' as const, label: 'Medium priority' };
  }
  return { badge: 'secondary' as const, label: 'Low priority' };
}

function pickIcon(icon: Insight['icon']) {
  if (icon === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  if (icon === 'shield') return <ShieldAlert className="h-4 w-4 text-red-500" />;
  if (icon === 'rocket') return <Rocket className="h-4 w-4 text-primary" />;
  return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
}

export function ActionableInsights({
  repositories,
  repositoryLimit,
}: {
  repositories: Repository[];
  repositoryLimit: number | 'unlimited';
}) {
  const [remoteInsights, setRemoteInsights] = useState<Insight[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const localInsights = useMemo(
    () => buildInsights(repositories, repositoryLimit),
    [repositories, repositoryLimit],
  );
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
    let isCancelled = false;
    const loadInsights = async () => {
      try {
        const res = await fetch('/api/insights', { cache: 'no-store' });
        const data = (await res.json()) as {
          ok?: boolean;
          insights?: Insight[];
          error?: string;
        };
        if (!res.ok || data.ok === false || !Array.isArray(data.insights)) {
          throw new Error(data.error ?? 'Failed to load insights.');
        }
        if (!isCancelled) {
          setRemoteInsights(data.insights);
          setLoadError(null);
        }
      } catch (error) {
        if (!isCancelled) {
          setRemoteInsights(null);
          setLoadError(error instanceof Error ? error.message : 'Failed to load insights.');
        }
      }
    };

    void loadInsights();
    return () => {
      isCancelled = true;
    };
  }, [repositorySignature]);

  const insights = remoteInsights ?? localInsights;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actionable Insights</CardTitle>
        <CardDescription>
          Prioritized recommendations based on health and execution outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loadError ? (
          <p className="text-xs text-muted-foreground">
            Using local insights while live insights sync.
          </p>
        ) : null}
        {insights.map((insight) => {
          const p = priorityStyles(insight.priority);
          return (
            <div key={insight.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {pickIcon(insight.icon)}
                    <p className="text-sm font-medium">{insight.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
                <Badge variant={p.badge}>{p.label}</Badge>
              </div>
              <div className="mt-3">
                <Button size="sm" variant="outline" asChild>
                  <Link href={insight.actionHref}>
                    {insight.actionLabel}
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
