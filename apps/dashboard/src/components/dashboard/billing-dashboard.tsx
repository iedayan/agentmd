'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Crown,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  CreditCard,
  Rocket,
} from 'lucide-react';
import { billingService, PlanStatus } from '@/lib/services/billing-service';
import { PlanId, getPlan } from '@/lib/billing/plans';
import { cn } from '@/lib/core/utils';
import { toast } from 'sonner';

export function BillingDashboard() {
  const [status, setStatus] = useState<PlanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    async function load() {
      const res = await billingService.getPlanStatus();
      if (res.ok && res.status) {
        setStatus(res.status);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === 'free') return;
    setUpgradingPlan(planId);
    toast.info(`Preparing ${planId} checkout...`);
    const res = await billingService.upgradePlan(planId);
    setUpgradingPlan(null);
    if (res.ok && res.checkoutUrl) {
      toast.success('Redirecting to secure checkout...');
      window.location.href = res.checkoutUrl;
    } else {
      toast.error(res.error ?? 'Could not start checkout');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-40 rounded-3xl bg-muted/20" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  const currentPlan = getPlan(status?.currentPlan || 'free');

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 glass-card p-10 bg-gradient-to-br from-background via-background/90 to-primary/10 shadow-glow/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                Account & Billing
              </p>
              <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] font-black px-2 py-0 border-luminescent">
                {currentPlan.name} PLAN
              </Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-gradient mt-4">
              Subscription Overview
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium text-muted-foreground leading-relaxed">
              Manage your compute quotas, team seats, and enterprise-grade security extensions.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="rounded-2xl border-border/40 font-black text-[11px] px-6 h-12 btn-tactile"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Payment
            </Button>
            <Button className="rounded-2xl shadow-glow font-black text-[11px] px-8 h-12 btn-tactile">
              <Rocket className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl group">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                    Compute
                  </span>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  Execution Minutes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-3xl font-black">
                    {status?.usage.executionMinutes}{' '}
                    <span className="text-sm text-muted-foreground font-medium">
                      /{' '}
                      {currentPlan.executionMinutes === Infinity
                        ? '∞'
                        : currentPlan.executionMinutes}
                    </span>
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground/60 uppercase">
                    Resetting in 12 days
                  </span>
                </div>
                <Progress
                  value={
                    ((status?.usage.executionMinutes || 0) /
                      (currentPlan.executionMinutes === Infinity
                        ? 1
                        : currentPlan.executionMinutes)) *
                    100
                  }
                  className="h-2 bg-muted/30"
                />
              </CardContent>
            </Card>

            <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl group">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">
                    Assets
                  </span>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">Repositories</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-3xl font-black">
                    {status?.usage.repositories}{' '}
                    <span className="text-sm text-muted-foreground font-medium">
                      / {currentPlan.repositories === Infinity ? '∞' : currentPlan.repositories}
                    </span>
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground/60 uppercase">
                    Manual Sync Active
                  </span>
                </div>
                <Progress
                  value={
                    ((status?.usage.repositories || 0) /
                      (currentPlan.repositories === Infinity ? 1 : currentPlan.repositories)) *
                    100
                  }
                  className="h-2 bg-indigo-500/20"
                />
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card bg-background/40 backdrop-blur-md border border-border/40 overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-border/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-foreground/90 tracking-tight">
                    Plan Selection
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground/60">
                    Compare tiers and unlock enterprise capabilities.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/10">
                {(['free', 'pro', 'enterprise'] as const).map((pid) => {
                  const p = getPlan(pid);
                  const isCurrent = status?.currentPlan === pid;
                  return (
                    <div
                      key={pid}
                      className={cn(
                        'p-8 flex flex-col transition-all duration-500',
                        isCurrent ? 'bg-primary/[0.03]' : 'hover:bg-primary/[0.01]',
                      )}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                          {p.name}
                        </span>
                        {isCurrent && (
                          <Badge
                            variant="success"
                            className="text-[8px] font-black uppercase border-luminescent"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl font-black tracking-tight">${p.price}</span>
                        <span className="text-muted-foreground/60 text-xs font-medium ml-1">
                          / mo
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 mb-8 leading-relaxed min-h-[40px]">
                        {pid === 'free'
                          ? 'For individuals and small personal projects.'
                          : pid === 'pro'
                            ? 'For growing teams that need performance and visibility.'
                            : 'The complete governance platform for security-first organizations.'}
                      </p>

                      <div className="space-y-4 mb-10 flex-1">
                        {[
                          {
                            text: `${p.repositories === Infinity ? 'Unlimited' : p.repositories} Repositories`,
                            ok: true,
                          },
                          {
                            text: `${p.executionMinutes === Infinity ? 'Unlimited' : p.executionMinutes} Min / mo`,
                            ok: true,
                          },
                          { text: 'SSO & SCIM', ok: p.sso },
                          { text: 'Granular RBAC', ok: p.rbac },
                          { text: 'Policy-as-Code', ok: p.policyAsCode },
                          { text: 'Dedicated Support', ok: p.dedicatedSupport },
                        ].map((feat, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'flex items-center gap-3 text-[11px]',
                              feat.ok
                                ? 'text-foreground/80 font-bold'
                                : 'text-muted-foreground/30 font-medium',
                            )}
                          >
                            <CheckCircle2
                              className={cn(
                                'h-3.5 w-3.5',
                                feat.ok ? 'text-primary' : 'text-border',
                              )}
                            />
                            {feat.text}
                          </div>
                        ))}
                      </div>

                      <Button
                        variant={
                          isCurrent ? 'outline' : pid === 'enterprise' ? 'default' : 'secondary'
                        }
                        disabled={isCurrent || upgradingPlan !== null}
                        onClick={() => void handleUpgrade(pid)}
                        className={cn(
                          'w-full rounded-2xl font-black text-[10px] uppercase tracking-widest py-6 btn-tactile shadow-glow/10',
                          pid === 'enterprise' &&
                            !isCurrent &&
                            'bg-primary shadow-glow hover:bg-primary/90',
                        )}
                      >
                        {isCurrent ? 'Current Plan' : pid === 'free' ? 'Downgrade' : 'Select Plan'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="glass-card bg-indigo-500/[0.03] border-indigo-500/20 shadow-2xl overflow-hidden relative border-beam border-luminescent">
            <CardHeader className="p-8">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 mb-6 border border-indigo-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black text-foreground/90 tracking-tight">
                Enterprise Guard
              </CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
                Unlock SSO, custom roles, and mandatory PR gates for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="p-5 rounded-[2rem] bg-background/60 border border-indigo-500/10 space-y-4">
                <div className="flex items-center gap-4 text-sm font-bold text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  SOC2 Compliance Logs
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-foreground/80">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  Custom Policy Engine
                </div>
              </div>
              <Button className="w-full rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-widest py-6 shadow-glow shadow-indigo-500/20 btn-tactile">
                Talk to Enterprise Sales
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card bg-primary/5 border-primary/20 overflow-hidden shadow-xl border-luminescent group">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Crown className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <CardTitle className="text-lg font-black tracking-tight">Featured Add-ons</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-border/10 hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black text-foreground/80">Static IP Workers</span>
                  <span className="text-[10px] text-muted-foreground font-medium underline">
                    Learn more
                  </span>
                </div>
                <span className="text-xs font-black text-primary">$15/mo</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-border/10 hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black text-foreground/80">Extra 500 Min</span>
                  <span className="text-[10px] text-muted-foreground font-medium underline">
                    Top up
                  </span>
                </div>
                <span className="text-xs font-black text-primary">$10</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
