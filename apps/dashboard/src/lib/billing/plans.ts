/**
 * AgentMD Subscription Plans & Feature Gating
 * Enterprise competes with AgentOps.ai ($249/mo)
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
