"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ArrowRight } from "lucide-react";

type Execution = { id: string; status: string; repositoryName: string };

export function ExecutionOverview() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [meta, setMeta] = useState<{ executionMinutesUsed?: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/executions?limit=50", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { ok?: boolean; executions?: Execution[]; meta?: { executionMinutesUsed?: number } }) => {
        if (!cancelled && d.ok) {
          setExecutions(d.executions ?? []);
          setMeta(d.meta ?? {});
        }
      })
      .catch(() => setExecutions([]))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const successCount = executions.filter((e) => e.status === "success").length;
  const failedCount = executions.filter((e) => e.status === "failed").length;
  const runningCount = executions.filter((e) => e.status === "running" || e.status === "pending").length;
  const completed = successCount + failedCount;
  const successRate = completed > 0 ? Math.round((successCount / completed) * 100) : null;

  return (
    <Card className="bento-card border-luminescent">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Executions</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Recent runs and success rate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-16 animate-pulse rounded-lg bg-muted/50" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <p className="text-lg font-bold text-emerald-500">{successCount}</p>
                <p className="text-[10px] text-muted-foreground">Success</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-2">
                <p className="text-lg font-bold text-red-500">{failedCount}</p>
                <p className="text-[10px] text-muted-foreground">Failed</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                <p className="text-lg font-bold text-primary">{runningCount}</p>
                <p className="text-[10px] text-muted-foreground">Active</p>
              </div>
            </div>
            {successRate != null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Success rate</span>
                <Badge variant={successRate >= 80 ? "success" : successRate >= 50 ? "warning" : "destructive"}>
                  {successRate}%
                </Badge>
              </div>
            )}
            {meta.executionMinutesUsed != null && (
              <p className="text-xs text-muted-foreground">
                {meta.executionMinutesUsed.toFixed(1)} min used this month
              </p>
            )}
          </>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
            <Link href="/dashboard/executions">
              View runs
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/dashboard/analytics">Analytics</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
