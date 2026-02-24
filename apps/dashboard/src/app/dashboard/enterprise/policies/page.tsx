"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type PolicyRule = {
  id: string;
  name: string;
  enabled: boolean;
  requireApprovalForPatterns: string[];
  blockPatterns: string[];
};

type GitHubGate = {
  repositoryId: string;
  repositoryName: string;
  requiredChecks: string[];
  checks: Record<string, "success" | "failed" | "pending" | "missing">;
  updatedAt: string;
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [gates, setGates] = useState<GitHubGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preflightRepoId, setPreflightRepoId] = useState("1");
  const [preflightAgentId, setPreflightAgentId] = useState("deploy-agent");
  const [preflightResult, setPreflightResult] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policiesRes, gatesRes] = await Promise.all([
        fetch("/api/policies", { cache: "no-store" }),
        fetch("/api/github/checks", { cache: "no-store" }),
      ]);
      const policiesBody = (await policiesRes.json()) as {
        ok?: boolean;
        policies?: PolicyRule[];
        error?: string;
      };
      const gatesBody = (await gatesRes.json()) as {
        ok?: boolean;
        gates?: GitHubGate[];
        error?: string;
      };
      if (!policiesRes.ok || policiesBody.ok === false) {
        throw new Error(policiesBody.error ?? "Failed to load policies.");
      }
      if (!gatesRes.ok || gatesBody.ok === false) {
        throw new Error(gatesBody.error ?? "Failed to load status gates.");
      }
      setPolicies(policiesBody.policies ?? []);
      setGates(gatesBody.gates ?? []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const policyYamlPreview = useMemo(() => {
    return `version: "1"
defaultApproval: ask
rules:
${policies
  .map(
    (policy) => `  - id: ${policy.id}
    name: ${policy.name}
    enabled: ${policy.enabled}
    requireApprovalForPatterns: [${policy.requireApprovalForPatterns.join(", ")}]
    blockPatterns: [${policy.blockPatterns.join(", ")}]`
  )
  .join("\n")}`;
  }, [policies]);

  const togglePolicy = async (id: string) => {
    const next = policies.map((policy) =>
      policy.id === id ? { ...policy, enabled: !policy.enabled } : policy
    );
    setPolicies(next);
    const res = await fetch("/api/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policies: next }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok || body.ok === false) {
      setError(body.error ?? "Failed to update policies.");
      return;
    }
    setMessage("Policies updated.");
  };

  const updateCheckStatus = async (
    repositoryId: string,
    checkName: string,
    status: "success" | "failed" | "pending"
  ) => {
    const res = await fetch("/api/github/checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repositoryId, checkName, status }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok || body.ok === false) {
      setError(body.error ?? "Failed to update check status.");
      return;
    }
    setMessage(`Updated ${checkName} to ${status}.`);
    void loadData();
  };

  const runPreflight = async () => {
    const res = await fetch("/api/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repositoryId: preflightRepoId,
        trigger: "manual",
        requestedBy: "enterprise_admin",
        agentId: preflightAgentId,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      code?: string;
      details?: { approvalId?: string };
    };
    if (!res.ok || body.ok === false) {
      setPreflightResult(
        `Blocked: ${body.error ?? "Unknown reason"}${body.details?.approvalId ? ` (approval: ${body.details.approvalId})` : ""}`
      );
      return;
    }
    setPreflightResult("Allowed: all policy and status gates passed.");
  };

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Policy-as-Code & Status Gates</h1>
        <p className="text-muted-foreground">
          Enforce policies before execute, with required GitHub status checks.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Policy Rules</CardTitle>
          <CardDescription>
            Toggle rule enforcement and keep policies in version-controlled YAML.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading policies…</p>
          ) : (
            policies.map((policy) => (
              <div key={policy.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{policy.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {policy.id}</p>
                  </div>
                  <Button size="sm" variant={policy.enabled ? "default" : "outline"} onClick={() => void togglePolicy(policy.id)}>
                    {policy.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {policy.requireApprovalForPatterns.map((pattern) => (
                    <Badge key={`approve-${pattern}`} variant="warning">
                      Approve: {pattern}
                    </Badge>
                  ))}
                  {policy.blockPatterns.map((pattern) => (
                    <Badge key={`block-${pattern}`} variant="destructive">
                      Block: {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub Required Status Gates</CardTitle>
          <CardDescription>
            Simulate required status checks used as merge and execution gates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {gates.map((gate) => (
            <div key={gate.repositoryId} className="rounded-lg border p-3">
              <p className="font-medium">{gate.repositoryName}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {gate.requiredChecks.map((check) => {
                  const status = gate.checks[check] ?? "missing";
                  return (
                    <div key={check} className="rounded-md border px-2 py-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span>{check}</span>
                        <Badge
                          variant={
                            status === "success"
                              ? "success"
                              : status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex gap-1">
                        {(["success", "pending", "failed"] as const).map((nextStatus) => (
                          <Button
                            key={nextStatus}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1 text-[10px]"
                            onClick={() => void updateCheckStatus(gate.repositoryId, check, nextStatus)}
                          >
                            {nextStatus}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preflight Enforcement Test</CardTitle>
          <CardDescription>
            Test whether an execution would pass policy and required status gates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={preflightRepoId}
              onChange={(event) => setPreflightRepoId(event.target.value)}
              placeholder="Repository ID"
            />
            <Input
              value={preflightAgentId}
              onChange={(event) => setPreflightAgentId(event.target.value)}
              placeholder="Agent ID (e.g. deploy-agent)"
            />
          </div>
          <Button onClick={() => void runPreflight()}>Run Preflight</Button>
          {preflightResult ? (
            <p className="text-sm text-muted-foreground">{preflightResult}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Policy YAML Snapshot</CardTitle>
          <CardDescription>Generated preview of active policy configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded bg-muted p-4 text-xs overflow-x-auto">{policyYamlPreview}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
