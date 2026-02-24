"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AuditLogEntry = {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: unknown;
};

export function AuditLogView() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/audit?limit=100", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        logs?: AuditLogEntry[];
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "Failed to load audit logs.");
      }
      setLogs(data.logs ?? []);
    } catch (loadError) {
      setLogs([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const actionLabel = (a: string) =>
    a.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const exportCsv = () => {
    if (!logs.length) return;
    const header = ["timestamp", "userId", "action", "resourceType", "resourceId", "details"];
    const rows = logs.map((log) => [
      log.timestamp,
      log.userId,
      log.action,
      log.resourceType,
      log.resourceId,
      JSON.stringify(log.details ?? ""),
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
    a.download = "audit-activity.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={!logs.length}
        >
          Export (CSV)
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted/40" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => void loadLogs()}>
              Retry
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No audit events yet.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 rounded-lg border p-4 text-sm"
              >
                <span className="text-muted-foreground shrink-0 w-40">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <Badge variant="secondary">{actionLabel(log.action)}</Badge>
                <span className="text-muted-foreground">{log.userId}</span>
                <span className="truncate">{log.resourceType}</span>
                {typeof log.details !== "undefined" && (
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {JSON.stringify(log.details)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
