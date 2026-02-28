'use client';

import { useMemo } from 'react';
import {
  getPlan,
  canAddRepository,
  hasExecutionMinutes,
  canUseParallelExecution,
  type PlanId,
} from '@/lib/billing/plans';

/**
 * Feature gating hook based on subscription plan.
 * In production, planId and usage would come from auth/session.
 */
export function useFeatureGate(
  planId: PlanId = 'free',
  usage?: { repoCount: number; usedMinutes: number },
) {
  return useMemo(() => {
    const plan = getPlan(planId);
    const repoCount = usage?.repoCount ?? 0;
    const usedMinutes = usage?.usedMinutes ?? 0;

    return {
      plan,
      planId,
      canAddRepo: canAddRepository(planId, repoCount),
      hasExecutionMinutes: hasExecutionMinutes(planId, usedMinutes),
      canUseParallel: canUseParallelExecution(planId),
      repoLimit: plan.repositories,
      executionMinutesLimit: plan.executionMinutes,
      usedMinutes,
    };
  }, [planId, usage?.repoCount, usage?.usedMinutes]);
}
