import { describe, it, expect } from "vitest";
import {
  computeTrustScore,
  isCertified,
  SECURITY_CHECKLIST,
} from "../marketplace/verification.js";
import type { TrustScoreBreakdown } from "../marketplace/types.js";

describe("computeTrustScore", () => {
  it("computes weighted average of breakdown", () => {
    const breakdown: TrustScoreBreakdown = {
      testCoverage: 80,
      userReviews: 100,
      securityCompliance: 100,
      updateFrequency: 80,
    };
    const score = computeTrustScore(breakdown);
    expect(score).toBeGreaterThanOrEqual(85);
    expect(score).toBeLessThanOrEqual(95);
  });

  it("returns 0 for all zeros", () => {
    const breakdown: TrustScoreBreakdown = {
      testCoverage: 0,
      userReviews: 0,
      securityCompliance: 0,
      updateFrequency: 0,
    };
    expect(computeTrustScore(breakdown)).toBe(0);
  });

  it("returns 100 for all 100", () => {
    const breakdown: TrustScoreBreakdown = {
      testCoverage: 100,
      userReviews: 100,
      securityCompliance: 100,
      updateFrequency: 100,
    };
    expect(computeTrustScore(breakdown)).toBe(100);
  });
});

describe("isCertified", () => {
  it("returns true when certified, score >= 70, security >= 80", () => {
    const verification = {
      certified: true,
      trustScore: 85,
      breakdown: {
        testCoverage: 80,
        userReviews: 90,
        securityCompliance: 90,
        updateFrequency: 80,
      },
      lastVerified: "2024-01-01",
    };
    expect(isCertified(verification)).toBe(true);
  });

  it("returns false when trustScore < 70", () => {
    const verification = {
      certified: true,
      trustScore: 65,
      breakdown: {
        testCoverage: 60,
        userReviews: 60,
        securityCompliance: 90,
        updateFrequency: 60,
      },
      lastVerified: "2024-01-01",
    };
    expect(isCertified(verification)).toBe(false);
  });

  it("returns false when securityCompliance < 80", () => {
    const verification = {
      certified: true,
      trustScore: 85,
      breakdown: {
        testCoverage: 90,
        userReviews: 90,
        securityCompliance: 70,
        updateFrequency: 90,
      },
      lastVerified: "2024-01-01",
    };
    expect(isCertified(verification)).toBe(false);
  });

  it("returns false when certified is false", () => {
    const verification = {
      certified: false,
      trustScore: 90,
      breakdown: {
        testCoverage: 90,
        userReviews: 90,
        securityCompliance: 90,
        updateFrequency: 90,
      },
      lastVerified: "2024-01-01",
    };
    expect(isCertified(verification)).toBe(false);
  });
});

describe("SECURITY_CHECKLIST", () => {
  it("includes expected items", () => {
    expect(SECURITY_CHECKLIST).toContain("no_dangerous_commands");
    expect(SECURITY_CHECKLIST).toContain("permissions_declared");
    expect(SECURITY_CHECKLIST).toContain("no_hardcoded_secrets");
    expect(SECURITY_CHECKLIST).toContain("guardrails_present");
  });
});
