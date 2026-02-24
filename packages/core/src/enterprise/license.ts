/**
 * AgentMD License Key Activation
 * Enterprise self-hosted deployments require a valid license.
 */

export interface LicenseInfo {
  valid: boolean;
  plan: "enterprise";
  expiresAt?: string;
  features: string[];
  maxSeats?: number;
  organizationId?: string;
}

const FEATURES_ENTERPRISE = [
  "self-hosted",
  "sso",
  "rbac",
  "audit-logs",
  "approval-workflows",
  "policy-as-code",
  "custom-dashboards",
  "sla-99.9",
  "dedicated-support",
];

/**
 * Validate license key. In production, this would verify a cryptographic signature.
 * Format: AGENTMD-<base64-encoded-json>-<signature>
 */
export function validateLicense(key: string | undefined): LicenseInfo {
  if (!key || !key.startsWith("AGENTMD-")) {
    return {
      valid: false,
      plan: "enterprise",
      features: [],
    };
  }

  try {
    const parts = key.split("-");
    if (parts.length < 3) {
      return { valid: false, plan: "enterprise", features: [] };
    }

    const payload = Buffer.from(parts[1], "base64").toString("utf-8");
    const data = JSON.parse(payload) as {
      plan: string;
      exp?: number;
      org?: string;
      seats?: number;
    };

    if (data.exp && Date.now() > data.exp * 1000) {
      return {
        valid: false,
        plan: "enterprise",
        features: [],
      };
    }

    return {
      valid: true,
      plan: "enterprise",
      expiresAt: data.exp ? new Date(data.exp * 1000).toISOString() : undefined,
      features: FEATURES_ENTERPRISE,
      maxSeats: data.seats,
      organizationId: data.org,
    };
  } catch {
    return { valid: false, plan: "enterprise", features: [] };
  }
}

export function isEnterpriseLicensed(key: string | undefined): boolean {
  return validateLicense(key).valid;
}
