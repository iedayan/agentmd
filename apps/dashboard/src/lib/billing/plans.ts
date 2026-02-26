/**
 * AgentMD Subscription Plans & Feature Gating
 * Enterprise competes with AgentOps.ai ($249/mo)
 *
 * AppSumo tiers: Lifetime deals with monthly usage limits (resets each month).
 * Tier 1–3 map to Pro-level features; Enterprise remains separate.
 */

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    repositories: 3,
    executionMinutes: 100,
    logRetentionDays: 7,
    parallelExecution: false,
    teamSeats: 1,
    notifications: false,
    support: "community",
    selfHosted: false,
    sso: false,
    rbac: false,
    auditLogs: false,
    approvalWorkflows: false,
    policyAsCode: false,
    customDashboards: false,
    sla: null as string | null,
    dedicatedSupport: false,
  },
  pro: {
    name: "Pro",
    price: 49,
    repositories: Infinity,
    executionMinutes: 1000,
    logRetentionDays: 30,
    parallelExecution: true,
    teamSeats: 5,
    notifications: true,
    support: "priority",
    selfHosted: false,
    sso: false,
    rbac: false,
    auditLogs: false,
    approvalWorkflows: false,
    policyAsCode: false,
    customDashboards: false,
    sla: null,
    dedicatedSupport: false,
  },
  enterprise: {
    name: "Enterprise",
    price: 249,
    repositories: Infinity,
    executionMinutes: Infinity,
    logRetentionDays: 90,
    parallelExecution: true,
    teamSeats: Infinity,
    notifications: true,
    support: "dedicated",
    selfHosted: true,
    sso: true,
    rbac: true,
    auditLogs: true,
    approvalWorkflows: true,
    policyAsCode: true,
    customDashboards: true,
    sla: "99.9%",
    dedicatedSupport: true,
  },
  /** AppSumo Tier 1 — $69 lifetime. 5 repos, 500 exec min/month. */
  appsumo_tier1: {
    name: "AppSumo Tier 1",
    price: 0,
    repositories: 5,
    executionMinutes: 500,
    logRetentionDays: 14,
    parallelExecution: true,
    teamSeats: 1,
    notifications: true,
    support: "priority",
    selfHosted: false,
    sso: false,
    rbac: false,
    auditLogs: false,
    approvalWorkflows: false,
    policyAsCode: false,
    customDashboards: false,
    sla: null,
    dedicatedSupport: false,
  },
  /** AppSumo Tier 2 — $149 lifetime. 15 repos, 2000 exec min/month. */
  appsumo_tier2: {
    name: "AppSumo Tier 2",
    price: 0,
    repositories: 15,
    executionMinutes: 2000,
    logRetentionDays: 30,
    parallelExecution: true,
    teamSeats: 5,
    notifications: true,
    support: "priority",
    selfHosted: false,
    sso: false,
    rbac: false,
    auditLogs: false,
    approvalWorkflows: false,
    policyAsCode: false,
    customDashboards: false,
    sla: null,
    dedicatedSupport: false,
  },
  /** AppSumo Tier 3 — $299 lifetime. 30 repos, 5000 exec min/month. */
  appsumo_tier3: {
    name: "AppSumo Tier 3",
    price: 0,
    repositories: 30,
    executionMinutes: 5000,
    logRetentionDays: 60,
    parallelExecution: true,
    teamSeats: 10,
    notifications: true,
    support: "priority",
    selfHosted: false,
    sso: false,
    rbac: false,
    auditLogs: false,
    approvalWorkflows: false,
    policyAsCode: false,
    customDashboards: false,
    sla: null,
    dedicatedSupport: false,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(planId: PlanId) {
  return PLANS[planId] ?? PLANS.free;
}

export function canAddRepository(planId: PlanId, currentCount: number): boolean {
  const plan = getPlan(planId);
  return currentCount < plan.repositories;
}

export function hasExecutionMinutes(planId: PlanId, usedMinutes: number): boolean {
  const plan = getPlan(planId);
  return usedMinutes < plan.executionMinutes;
}

export function canUseParallelExecution(planId: PlanId): boolean {
  return getPlan(planId).parallelExecution;
}

export function getLogRetentionDays(planId: PlanId): number {
  return getPlan(planId).logRetentionDays;
}

/** AppSumo plan IDs (lifetime deals). */
export const APPSUMO_PLAN_IDS = [
  "appsumo_tier1",
  "appsumo_tier2",
  "appsumo_tier3",
] as const satisfies readonly PlanId[];

export type AppSumoPlanId = (typeof APPSUMO_PLAN_IDS)[number];

export function isAppSumoPlan(planId: PlanId): planId is AppSumoPlanId {
  return APPSUMO_PLAN_IDS.includes(planId as AppSumoPlanId);
}

/** Whether a plan has Pro-level features (Pro, Enterprise, or AppSumo). */
export function hasProFeatures(planId: PlanId): boolean {
  if (planId === "pro" || planId === "enterprise") return true;
  return isAppSumoPlan(planId);
}
