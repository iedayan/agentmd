import { PlanId } from "../billing/plans";

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
        // In a real app, this would fetch from /api/billing/status
        // Mocking return for Phase 4 demo
        return {
            ok: true,
            status: {
                currentPlan: "free",
                usage: {
                    repositories: 3,
                    executionMinutes: 88,
                    teamSeats: 1
                }
            }
        };
    },

    async upgradePlan(planId: PlanId): Promise<{ ok: boolean; checkoutUrl?: string; error?: string }> {
        const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId }),
        });
        const body = await res.json();
        return res.ok ? { ok: true, checkoutUrl: body.url } : { ok: false, error: body.error };
    },

    async getUsageMetrics(): Promise<{ ok: boolean; metrics?: any; error?: string }> {
        const res = await fetch("/api/billing/usage", { cache: "no-store" });
        const body = await res.json();
        return res.ok ? { ok: true, metrics: body.metrics } : { ok: false, error: body.error };
    }
};
