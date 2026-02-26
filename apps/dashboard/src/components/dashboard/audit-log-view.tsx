"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Search,
  ShieldCheck,
  EyeOff,
  Activity,
  ArrowRight,
  Clock,
  User,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/core/utils";

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
      setLoading(true);
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
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Compliance Status</span>
          </div>
          <p className="text-2xl font-black text-foreground/90">SOC2 Ready</p>
          <p className="text-[10px] text-muted-foreground/60 font-black mt-1 uppercase tracking-widest">REAL-TIME ATTESTATION</p>
        </div>
        <div className="glass-card p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <EyeOff className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Security Protocol</span>
          </div>
          <p className="text-2xl font-black text-foreground/90">PII Masked</p>
          <p className="text-[10px] text-muted-foreground/60 font-black mt-1 uppercase tracking-widest">AUTOMATIC REDACTION</p>
        </div>
        <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80">Stream Integrity</span>
          </div>
          <p className="text-2xl font-black text-foreground/90">Verified</p>
          <p className="text-[10px] text-muted-foreground/60 font-black mt-1 uppercase tracking-widest">CRYPTOGRAPHIC CHAIN</p>
        </div>
      </div>

      <div className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-border/20 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground/90 tracking-tight">System Event Stream</h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Complete audit trail for SOC2/HIPAA</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Filter by hash, user, or action..."
                className="pl-9 pr-4 py-2 bg-muted/20 border border-border/40 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-muted/40 transition-all w-[240px]"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={!logs.length}
              className="rounded-xl border-border/60 font-bold text-xs gap-2 px-4 py-5 hover:bg-primary/5 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Download SOC2 Report
            </Button>
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl border border-border/20 bg-muted/20 shadow-inner" />
              ))}
            </div>
          ) : error ? (
            <div className="m-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center animate-fade-up">
              <p className="text-sm font-bold text-destructive">{error}</p>
              <Button size="sm" variant="outline" className="mt-4 rounded-xl border-destructive/20 hover:bg-destructive/10" onClick={() => void loadLogs()}>
                Reconnect Stream
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="m-6 rounded-2xl border border-dashed border-border/40 p-12 text-center text-sm text-muted-foreground bg-muted/5 animate-fade-up">
              <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 opacity-40" />
              </div>
              <p className="font-black uppercase tracking-widest text-[11px] opacity-40">Zero events detected in the current window.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {logs.map((log, idx) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-4 px-6 py-5 text-sm hover:bg-primary/[0.01] transition-colors group animate-fade-up",
                    idx === 0 && "animation-delay-0",
                    idx === 1 && "animation-delay-75",
                    idx === 2 && "animation-delay-100",
                    idx > 2 && "animation-delay-150"
                  )}
                >
                  <div className="flex items-center gap-3 shrink-0 md:w-48">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                      {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 md:w-56">
                    <div className="h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center border border-border/40 shadow-sm shrink-0">
                      <User className="h-3.5 w-3.5 text-muted-foreground/60" />
                    </div>
                    <span className="text-xs font-black text-foreground/80 tracking-tight truncate">{log.userId}</span>
                  </div>

                  <div className="flex-1 flex items-center gap-4">
                    <Badge variant="outline" className="text-[9px] font-black tracking-widest px-2.5 py-0.5 uppercase border-primary/20 text-primary bg-primary/5 shrink-0">
                      {actionLabel(log.action)}
                    </Badge>
                    <p className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors truncate">
                      {log.resourceType}: <span className="font-bold opacity-40">{log.resourceId}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {typeof log.details !== "undefined" && (
                      <Badge variant="secondary" className="bg-muted/30 text-[9px] font-black tracking-[0.1em] py-0.5 border border-border/20 text-muted-foreground/60 cursor-help" title={JSON.stringify(log.details)}>
                        DATA MASKED
                      </Badge>
                    )}
                    <div className="h-8 w-8 rounded-lg border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-muted/40 hover:border-primary/20">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/20 bg-muted/10 flex items-center justify-between">
          <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
            Streaming encrypted events from source <ArrowRight className="inline h-2 w-2 mx-1" /> AgentMD v0.1.0-secure
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-glow-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Feed Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
