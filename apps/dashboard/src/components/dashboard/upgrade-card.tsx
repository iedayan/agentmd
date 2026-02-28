'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPlan } from '@/lib/billing/plans';

export function UpgradeCard() {
  const [billingConfigured, setBillingConfigured] = useState<boolean | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<'pro' | 'enterprise' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => setBillingConfigured(d.configured ?? false))
      .catch(() => setBillingConfigured(false));
  }, []);

  const handleUpgrade = async (planId: 'pro' | 'enterprise') => {
    setLoadingPlan(planId);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        setError(data.error ?? 'Unable to start checkout. Please try again.');
        return;
      }
      const { url } = data;
      if (url) window.location.href = url;
      else setError('Checkout URL was not returned. Please try again.');
    } catch (err) {
      setError('Unable to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const proPlan = getPlan('pro');
  const enterprisePlan = getPlan('enterprise');
  const billingDisabled = billingConfigured === false;

  return (
    <div className="space-y-6">
      {billingConfigured === false && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-500">
          Billing is not configured for this environment. Configure Stripe to enable upgrades.
        </div>
      )}
      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Pro — ${proPlan.price}/month</CardTitle>
          <CardDescription>
            Unlimited repos, 1000 execution minutes, team collaboration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Unlimited repositories</li>
            <li>1000 execution minutes/month</li>
            <li>Parallel test execution</li>
            <li>5 team seats</li>
            <li>Slack/Discord notifications</li>
            <li>30-day log retention</li>
            <li>Priority email support</li>
          </ul>
          <Button
            className="w-full"
            onClick={() => handleUpgrade('pro')}
            disabled={loadingPlan !== null || billingDisabled}
          >
            {billingDisabled
              ? 'Billing unavailable'
              : loadingPlan === 'pro'
                ? 'Redirecting...'
                : 'Upgrade to Pro'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle>Enterprise — ${enterprisePlan.price}/month</CardTitle>
          <CardDescription>Self-hosted, SSO, RBAC, audit logs, 99.9% SLA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>All Pro features</li>
            <li>Self-hosted (Docker, Kubernetes)</li>
            <li>SSO/SAML (Okta, Azure AD, Google)</li>
            <li>RBAC with custom roles</li>
            <li>Audit logs (SOC2, HIPAA ready)</li>
            <li>Approval workflows, policy-as-code</li>
            <li>99.9% uptime SLA</li>
            <li>Dedicated support engineer</li>
          </ul>
          <Button variant="outline" className="w-full" asChild>
            <Link href="mailto:sales@agentmd.online?subject=Enterprise%20Inquiry">
              Contact Sales
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
