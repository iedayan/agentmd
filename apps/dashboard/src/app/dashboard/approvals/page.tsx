"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

type ApprovalRequest = {
  id: string;
  repositoryId: string;
  repositoryName: string;
  requestedBy: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows/approvals", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; approvals?: ApprovalRequest[]; error?: string };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "Failed to load approvals");
      }
      setApprovals(data.approvals ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load approvals");
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  const decide = async (approvalId: string, decision: "approved" | "rejected") => {
    setDeciding(approvalId);
    try {
      const res = await fetch("/api/workflows/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          decision,
          decidedBy: "current_user",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "Failed to update approval");
      }
      await loadApprovals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update approval");
    } finally {
      setDeciding(null);
    }
  };

  const pending = approvals.filter((a) => a.status === "pending");

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Human-in-the-loop approval requests. Approve or reject commands that require policy approval.
        </p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={() => void loadApprovals()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <Card className="bento-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Pending ({pending.length})
                </CardTitle>
                <CardDescription>
                  Approve or reject these requests to unblock executions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pending.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{a.repositoryName}</p>
                      <p className="text-sm text-muted-foreground mt-1">{a.reason}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Requested by {a.requestedBy} · {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => void decide(a.id, "approved")}
                        disabled={deciding === a.id}
                      >
                        {deciding === a.id ? "..." : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => void decide(a.id, "rejected")}
                        disabled={deciding === a.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bento-card">
            <CardHeader>
              <CardTitle className="text-lg">All approvals</CardTitle>
              <CardDescription>
                Recent approval requests and decisions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvals.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
                  <p>No approval requests yet.</p>
                  <p className="mt-2">
                    Approvals are created when an execution hits a policy that requires human approval.
                  </p>
                  <Link href="/dashboard/enterprise/policies" className="text-primary hover:underline mt-2 inline-block">
                    Configure policies →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvals.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border/50 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">{a.repositoryName}</span>
                          <Badge
                            variant={
                              a.status === "pending"
                                ? "secondary"
                                : a.status === "approved"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {a.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{a.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {a.requestedBy} · {new Date(a.createdAt).toLocaleString()}
                          {a.decidedBy && a.decidedAt && (
                            <> · Decided by {a.decidedBy} at {new Date(a.decidedAt).toLocaleString()}</>
                          )}
                        </p>
                      </div>
                      {a.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void decide(a.id, "approved")}
                            disabled={deciding === a.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => void decide(a.id, "rejected")}
                            disabled={deciding === a.id}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
