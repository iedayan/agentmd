/**
 * Agent Marketplace Verification Program
 * "Certified AGENTS.md Compatible" badge
 */

import type { TrustScoreBreakdown } from './types.js';

export interface VerificationStatus {
  certified: boolean;
  trustScore: number;
  breakdown: TrustScoreBreakdown;
  lastVerified: string;
  nextVerification?: string;
}

/** Security review checklist */
export const SECURITY_CHECKLIST = [
  'no_dangerous_commands',
  'permissions_declared',
  'no_hardcoded_secrets',
  'guardrails_present',
] as const;

/** Performance benchmarks (execution time thresholds) */
export interface PerformanceBenchmark {
  command: string;
  maxDurationMs: number;
  actualMs?: number;
  passed?: boolean;
}

export function computeTrustScore(breakdown: TrustScoreBreakdown): number {
  const { testCoverage, userReviews, securityCompliance, updateFrequency } = breakdown;
  return Math.round(
    testCoverage * 0.25 + userReviews * 0.35 + securityCompliance * 0.25 + updateFrequency * 0.15,
  );
}

export function isCertified(verification: VerificationStatus): boolean {
  return (
    verification.certified &&
    verification.trustScore >= 70 &&
    verification.breakdown.securityCompliance >= 80
  );
}
