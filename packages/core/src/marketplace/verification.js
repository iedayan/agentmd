/**
 * Agent Marketplace Verification Program
 * "Certified AGENTS.md Compatible" badge
 */
/** Security review checklist */
export const SECURITY_CHECKLIST = [
  'no_dangerous_commands',
  'permissions_declared',
  'no_hardcoded_secrets',
  'guardrails_present',
];
export function computeTrustScore(breakdown) {
  const { testCoverage, userReviews, securityCompliance, updateFrequency } = breakdown;
  return Math.round(
    testCoverage * 0.25 + userReviews * 0.35 + securityCompliance * 0.25 + updateFrequency * 0.15,
  );
}
export function isCertified(verification) {
  return (
    verification.certified &&
    verification.trustScore >= 70 &&
    verification.breakdown.securityCompliance >= 80
  );
}
