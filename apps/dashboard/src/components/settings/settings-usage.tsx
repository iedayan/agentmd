"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SettingsUsageProps {
  planId: string;
  repositoryLimit: number;
  executionMinutesLimit: number;
  logRetentionDays: number;
}

export function SettingsUsage({
  planId,
  repositoryLimit,
  executionMinutesLimit,
  logRetentionDays,
}: SettingsUsageProps) {
  const [usage, setUsage] = useState<{
    planId: string;
    repositoryLimit: number;
    executionMinutesLimit: number;
    logRetentionDays: number;
    repositories: number;
    executionMinutesUsed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/usage", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.repositories !== undefined) {
          setUsage({
            planId: data.planId ?? planId,
            repositoryLimit: data.repositoryLimit ?? repositoryLimit,
            executionMinutesLimit: data.executionMinutesLimit ?? executionMinutesLimit,
            logRetentionDays: data.logRetentionDays ?? logRetentionDays,
            repositories: data.repositories,
            executionMinutesUsed: data.executionMinutesUsed ?? 0,
          });
        }
      })
      .catch(() => {
        // Ignore error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only; planId/limits come from usage response
  }, []);

  const repos = usage?.repositories ?? 0;
  const minutes = usage?.executionMinutesUsed ?? 0;
  const currentPlanId = usage?.planId ?? planId;
  const repoLimit =
    typeof (usage?.repositoryLimit ?? repositoryLimit) === "number"
      ? (usage?.repositoryLimit ?? repositoryLimit)
      : Infinity;
  const minLimit =
    typeof (usage?.executionMinutesLimit ?? executionMinutesLimit) === "number"
      ? (usage?.executionMinutesLimit ?? executionMinutesLimit)
      : Infinity;
  const retentionDays = usage?.logRetentionDays ?? logRetentionDays;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>
          {currentPlanId === "free"
            ? "Free tier — 3 repos, 100 min/month"
            : `${currentPlanId} plan`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>
            Repositories: {loading ? "…" : repos} /{" "}
            {repoLimit === Infinity ? "∞" : repoLimit}
          </p>
          <p>
            Execution minutes: {loading ? "…" : minutes.toFixed(1)} /{" "}
            {minLimit === Infinity ? "∞" : minLimit} this month
          </p>
          <p>Log retention: {retentionDays} days</p>
        </div>
        <Link href="/dashboard/settings/billing" className="inline-block mt-4">
          <Button variant="outline" size="sm">
            Manage billing
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
