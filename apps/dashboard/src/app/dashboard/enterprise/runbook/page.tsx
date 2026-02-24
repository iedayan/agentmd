"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RunbookResponse = {
  service: string;
  generatedAt: string;
  uptimeSeconds: number;
  checks: Array<{
    id: string;
    label: string;
    status: "ok" | "warn" | "info";
    detail: string;
  }>;
  governance: {
    webhookReceived: number;
    webhookProcessed: number;
    webhookSignatureFailures: number;
    webhookErrors: number;
    webhookSuccessRate: number;
    lastWebhookAt?: string;
    lastWebhookEvent?: string;
    lastWebhookError?: string;
    blockedByStatusGate: number;
    blockedByPolicy: number;
    approvalRequired: number;
    pendingApprovals: number;
    unreadNotifications: number;
    persistedStatePath: string;
  };
  usage: {
    repositories: number;
    executions: number;
    executionMinutesUsed: number;
    totalCommandsRun: number;
    totalCommandsFailed: number;
  };
  incidents: string[];
  recentAudit: Array<{
    id: string;
    timestamp: string;
    action: string;
    resourceType: string;
    userId: string;
  }>;
};

export default function OpsRunbookPage() {
  const [data, setData] = useState<RunbookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/runbook", { cache: "no-store" });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
      } & Partial<RunbookResponse>;
      if (!res.ok || body.ok === false) {
        throw new Error(body.error ?? "Failed to load runbook.");
      }
      setData(body as RunbookResponse);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load runbook.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="p-8 max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ops Runbook</h1>
          <p className="text-muted-foreground">
            Operational readiness, webhook health, governance controls, and incident context.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric label="Webhook Success" value={`${data?.governance.webhookSuccessRate ?? 0}%`} />
        <Metric label="Pending Approvals" value={String(data?.governance.pendingApprovals ?? 0)} />
        <Metric label="Blocked by Policy" value={String(data?.governance.blockedByPolicy ?? 0)} />
        <Metric label="Unread Notifications" value={String(data?.governance.unreadNotifications ?? 0)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Readiness Checks</CardTitle>
          <CardDescription>
            System checks required to keep mission-critical workflows healthy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data?.checks ?? []).map((check) => (
            <div key={check.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{check.label}</p>
                <Badge
                  variant={
                    check.status === "ok"
                      ? "success"
                      : check.status === "warn"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {check.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{check.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open Incidents</CardTitle>
            <CardDescription>Action items requiring operational attention.</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.incidents.length ? (
              <ul className="space-y-2 text-sm">
                {data.incidents.map((incident, index) => (
                  <li key={index} className="rounded-md border p-2">
                    {incident}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No open incidents.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GitHub Webhook Diagnostics</CardTitle>
            <CardDescription>Recent webhook processing telemetry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Received: {data?.governance.webhookReceived ?? 0}</p>
            <p>Processed: {data?.governance.webhookProcessed ?? 0}</p>
            <p>Signature failures: {data?.governance.webhookSignatureFailures ?? 0}</p>
            <p>Errors: {data?.governance.webhookErrors ?? 0}</p>
            <p>
              Last event:{" "}
              {data?.governance.lastWebhookEvent
                ? `${data.governance.lastWebhookEvent} @ ${
                    data.governance.lastWebhookAt
                      ? new Date(data.governance.lastWebhookAt).toLocaleString()
                      : "unknown"
                  }`
                : "None"}
            </p>
            {data?.governance.lastWebhookError ? (
              <p className="text-destructive">Last error: {data.governance.lastWebhookError}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Events</CardTitle>
          <CardDescription>Last 20 control-plane events for incident triage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data?.recentAudit ?? []).map((event) => (
            <div key={event.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">
                  {event.action} · {event.resourceType}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">by {event.userId}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
