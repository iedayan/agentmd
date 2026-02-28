'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShieldAlert,
  Terminal,
  CheckCircle2,
  Zap,
  Code2,
  Dna,
  History,
  Lock,
  GitPullRequest,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/core/utils';
import { PolicyRule, GitHubGate } from '@/types';
import { governanceService } from '@/lib/services/governance-service';
import { FeatureGate } from '@/components/dashboard/feature-gate';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [gates, setGates] = useState<GitHubGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preflightRepoId, setPreflightRepoId] = useState('1');
  const [preflightAgentId, setPreflightAgentId] = useState('deploy-agent');
  const [preflightResult, setPreflightResult] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policiesRes, gatesRes] = await Promise.all([
        governanceService.getPolicies(),
        governanceService.getGithubGates(),
      ]);

      if (!policiesRes.ok) throw new Error(policiesRes.error ?? 'Failed to load policies.');
      if (!gatesRes.ok) throw new Error(gatesRes.error ?? 'Failed to load status gates.');

      setPolicies(policiesRes.policies ?? []);
      setGates(gatesRes.gates ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
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
    enabled: ${policy.status === 'active'}
    rules: [${policy.rules.join(', ')}]`,
  )
  .join('\n')}`;
  }, [policies]);

  const togglePolicy = async (id: string, currentStatus: 'active' | 'inactive' | 'bypass') => {
    const nextStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
    const res = await governanceService.togglePolicy(id, nextStatus);
    if (!res.ok) {
      setError(res.error ?? 'Failed to update policies.');
      return;
    }
    setMessage('Policy updated.');
    setTimeout(() => setMessage(null), 3000);
    void loadData();
  };

  const togglePrGate = async (id: string, currentEnforcement: boolean) => {
    const updated = policies.map((p) =>
      p.id === id ? { ...p, enforcePrGate: !currentEnforcement } : p,
    );
    const res = await governanceService.updatePolicies(updated);
    if (!res.ok) {
      setError(res.error ?? 'Failed to update PR Gate settings.');
      return;
    }
    setMessage(`PR Gate ${!currentEnforcement ? 'enabled' : 'disabled'} for policy.`);
    setTimeout(() => setMessage(null), 3000);
    void loadData();
  };

  const updateCheckStatus = async (
    repositoryId: string,
    checkName: string,
    status: 'success' | 'failed' | 'pending',
  ) => {
    const res = await governanceService.updateGithubGateStatus(repositoryId, checkName, status);
    if (!res.ok) {
      setError(res.error ?? 'Failed to update check status.');
      return;
    }
    setMessage(`Updated ${checkName} to ${status}.`);
    setTimeout(() => setMessage(null), 3000);
    void loadData();
  };

  const runPreflight = async () => {
    setPreflightResult('Running diagnostic...');
    const res = await governanceService.runPreflight({
      repositoryId: preflightRepoId,
      trigger: 'manual',
      requestedBy: 'enterprise_admin',
      agentId: preflightAgentId,
    });

    if (!res.ok) {
      setPreflightResult(
        `[BLOCKED] ${res.error ?? 'Policy rejection'}${res.details?.approvalId ? ` (REF: ${res.details.approvalId})` : ''}`,
      );
      return;
    }
    setPreflightResult('[ALLOWED] All governance gates and status checks passed.');
  };

  return (
    <FeatureGate feature="Policy-as-Code Enforcement" planRequired="enterprise">
      <div className="p-6 md:p-10 space-y-10">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 glass-card p-10 bg-gradient-to-br from-background via-background/90 to-primary/10 shadow-glow/5">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
              Governance Engine
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-gradient mt-4">
              Policy-as-Code
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium text-muted-foreground leading-relaxed">
              Enforce security guardrails and required GitHub status gates. High-stakes agentic
              actions are filtered through runtime YAML definitions.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-10">
            <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl">
              <CardHeader className="p-6 border-b border-border/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-foreground/90 tracking-tight">
                        Active Policy Set
                      </CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                        Runtime enforcement rules
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-glow-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                      Enforcement On
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 animate-pulse rounded-2xl border border-border/20 bg-muted/20"
                      />
                    ))}
                  </div>
                ) : (
                  policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="bento-card border-luminescent group p-6 transition-all duration-300 hover:border-primary/40"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-black text-foreground/90 tracking-tight group-hover:text-primary transition-colors">
                              {policy.name}
                            </p>
                            <Badge variant="outline" className="text-[10px] opacity-40 font-black">
                              ID: {policy.id}
                            </Badge>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {policy.requireApprovalForPatterns.map((pattern) => (
                              <Badge
                                key={`approve-${pattern}`}
                                variant="warning"
                                className="px-3 py-1 text-[9px] font-black tracking-widest uppercase"
                              >
                                <History className="h-3 w-3 mr-1" />
                                APPROVE: {pattern}
                              </Badge>
                            ))}
                            {policy.blockPatterns.map((pattern) => (
                              <Badge
                                key={`block-${pattern}`}
                                variant="destructive"
                                className="px-3 py-1 text-[9px] font-black tracking-widest uppercase"
                              >
                                <Lock className="h-3 w-3 mr-1" />
                                BLOCK: {pattern}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            <button
                              onClick={() => void togglePrGate(policy.id, policy.enforcePrGate)}
                              className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest',
                                policy.enforcePrGate
                                  ? 'bg-primary/10 border-primary/40 text-primary shadow-glow shadow-primary/10'
                                  : 'bg-muted/30 border-border/40 text-muted-foreground/50 hover:border-border/60',
                              )}
                            >
                              <GitPullRequest
                                className={cn('h-3 w-3', policy.enforcePrGate && 'animate-pulse')}
                              />
                              {policy.enforcePrGate ? 'Enforced as PR Gate' : 'Enforce as PR Gate'}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/40 bg-muted/30">
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                policy.status === 'active'
                                  ? 'bg-emerald-500'
                                  : 'bg-muted-foreground/30',
                              )}
                            />
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase">
                              {policy.status === 'active' ? 'ACTIVE' : 'IDLE'}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant={policy.status === 'active' ? 'default' : 'outline'}
                            onClick={() => void togglePolicy(policy.id, policy.status)}
                            className="rounded-xl font-bold text-[10px] px-5 py-4 btn-tactile h-9"
                          >
                            {policy.status === 'active' ? 'Disable Rule' : 'Enable Rule'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl">
              <CardHeader className="p-6 border-b border-border/10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <GitPullRequest className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-foreground/90 tracking-tight">
                      GitHub Status Gates
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                      Required merge & run checks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {gates.map((gate) => (
                  <div
                    key={gate.repositoryId}
                    className="bento-card bg-muted/20 border-border/40 p-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Dna className="h-4 w-4 text-primary opacity-60" />
                      <p className="text-sm font-black text-foreground/90 tracking-tight">
                        {gate.repositoryName}
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {gate.requiredChecks.map((check) => {
                        const status = gate.checks[check] ?? 'missing';
                        return (
                          <div
                            key={check}
                            className="rounded-2xl border border-border/40 bg-background/40 p-4 transition-all hover:bg-background/60"
                          >
                            <div className="flex items-center justify-between gap-4 mb-4">
                              <span className="text-[11px] font-black text-foreground tracking-tight truncate">
                                {check}
                              </span>
                              <Badge
                                variant={
                                  status === 'success'
                                    ? 'success'
                                    : status === 'failed'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                                className="text-[9px] font-black uppercase px-2.5 py-0.5"
                              >
                                {status}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {(['success', 'pending', 'failed'] as const).map((nextStatus) => (
                                <Button
                                  key={nextStatus}
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    'h-8 flex-1 font-black text-[9px] uppercase tracking-wider rounded-xl border border-transparent hover:bg-muted/40',
                                    status === nextStatus &&
                                      'border-primary/40 bg-primary/10 text-primary',
                                  )}
                                  onClick={() =>
                                    void updateCheckStatus(gate.repositoryId, check, nextStatus)
                                  }
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
          </div>

          <div className="lg:col-span-4 space-y-10">
            <Card className="glass-card bg-indigo-500/[0.03] border-indigo-500/20 shadow-2xl overflow-hidden relative border-beam">
              <CardHeader className="p-6 space-y-2 border-b border-indigo-500/10 bg-indigo-500/5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500 mb-2">
                  <Zap className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl font-black text-foreground/90 tracking-tight">
                  Diagnostic Lab
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">
                  Test execution preflights against runtime policies.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">
                      Repository Identifier
                    </label>
                    <Input
                      value={preflightRepoId}
                      onChange={(event) => setPreflightRepoId(event.target.value)}
                      placeholder="Repository ID"
                      className="bg-muted/20 rounded-xl border-border/40 focus:ring-indigo-500/40 text-sm font-bold h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">
                      Target Agent
                    </label>
                    <Input
                      value={preflightAgentId}
                      onChange={(event) => setPreflightAgentId(event.target.value)}
                      placeholder="Agent ID (e.g. deploy-agent)"
                      className="bg-muted/20 rounded-xl border-border/40 focus:ring-indigo-500/40 text-sm font-bold h-11"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => void runPreflight()}
                  className="w-full rounded-xl btn-tactile font-black text-[11px] uppercase tracking-widest py-6 bg-indigo-600 hover:bg-indigo-500 shadow-glow shadow-indigo-500/20"
                >
                  Trigger Dry Run
                </Button>

                <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-4 min-h-[100px] flex items-center justify-center text-center">
                  {preflightResult ? (
                    <p
                      className={cn(
                        'text-[11px] font-black font-mono leading-relaxed',
                        preflightResult.includes('ALLOWED') ? 'text-emerald-500' : 'text-amber-500',
                      )}
                    >
                      &gt; {preflightResult}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-indigo-500/40">
                      <Terminal className="h-6 w-6" />
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Awaiting Simulation
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card bg-muted/20 border-border/40 overflow-hidden shadow-xl group">
              <CardHeader className="p-6 border-b border-border/10">
                <div className="flex items-center gap-3">
                  <Code2 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-black text-foreground/90 tracking-tight uppercase tracking-widest">
                    Policy Blueprint (YAML)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-b border-border/10">
                <div className="relative">
                  <pre className="p-6 text-[10px] font-black font-mono leading-relaxed text-muted-foreground bg-muted/30 overflow-x-auto selection:bg-primary/20 max-h-[400px]">
                    {policyYamlPreview.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="w-4 shrink-0 opacity-20 select-none text-right">
                          {i + 1}
                        </span>
                        <span
                          className={cn(
                            line.trim().startsWith('-')
                              ? 'text-primary'
                              : line.includes('enabled: true')
                                ? 'text-emerald-500/70'
                                : line.includes('enabled: false')
                                  ? 'text-red-500/70'
                                  : '',
                          )}
                        >
                          {line}
                        </span>
                      </div>
                    ))}
                  </pre>
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-background/50 border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-background">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
              <div className="p-4 flex items-center justify-between text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest font-mono">
                <span>SHA256: 8A2F...E912</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                  READ ONLY
                </div>
              </div>
            </Card>
          </div>
        </div>

        {message && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
            <div className="glass-card border-primary/20 bg-primary/5 px-6 py-4 flex items-center gap-4 border-luminescent shadow-2xl">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="text-sm font-black text-foreground/90 tracking-tight">{message}</p>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
