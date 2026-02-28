import { PlanId } from '../billing/plans';

export interface PlanStatus {
  currentPlan: PlanId;
  isTrial?: boolean;
  trialEndsAt?: string;
  subscriptionId?: string;
  usage: {
    repositories: number;
    executionMinutes: number;
    teamSeats: number;
  };
}

/**
 * Service for managing Billing, Subscriptions, and Usage Entitlements.
 */
export const billingService = {
  async getPlanStatus(): Promise<{ ok: boolean; status?: PlanStatus; error?: string }> {
    const usageRes = await fetch('/api/account/usage', { cache: 'no-store' });
    if (!usageRes.ok) {
      const body = await usageRes.json().catch(() => ({}));
      return {
        ok: false,
        error: (body as { error?: string }).error ?? 'Failed to load plan status',
      };
    }
    const data = (await usageRes.json()) as {
      planId?: string;
      repositories?: number;
      executionMinutesUsed?: number;
      executionMinutesLimit?: number;
    };
    const planId = (data.planId as PlanId) ?? 'free';
    return {
      ok: true,
      status: {
        currentPlan: planId,
        usage: {
          repositories: data.repositories ?? 0,
          executionMinutes: Math.round((data.executionMinutesUsed ?? 0) * 100) / 100,
          teamSeats: 1,
        },
      },
    };
  },

  async upgradePlan(
    planId: PlanId,
  ): Promise<{ ok: boolean; checkoutUrl?: string; error?: string }> {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const body = await res.json();
    return res.ok ? { ok: true, checkoutUrl: body.url } : { ok: false, error: body.error };
  },

  async getUsageMetrics(): Promise<{
    ok: boolean;
    metrics?: Record<string, unknown>;
    error?: string;
  }> {
    const res = await fetch('/api/billing/usage', { cache: 'no-store' });
    const body = await res.json();
    return res.ok ? { ok: true, metrics: body.metrics } : { ok: false, error: body.error };
  },
};
