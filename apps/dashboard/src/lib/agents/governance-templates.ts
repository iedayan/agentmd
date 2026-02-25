/**
 * Governance templates for the agent setup wizard.
 * Mirrors @agentmd/core templates to avoid pulling Node.js deps (fs, child_process) into the client bundle.
 */

export interface GovernanceTemplate {
  id: string;
  name: string;
  description: string;
  frontmatter: Record<string, unknown>;
}

export const BASELINE_SECURITY_TEMPLATE: GovernanceTemplate = {
  id: "baseline-security",
  name: "Baseline Security",
  description: "Recommended minimal security posture for most projects.",
  frontmatter: {
    permissions: {
      shell: {
        deny: [
          "rm -rf /",
          "sudo",
          "su -",
          "curl * | sh",
          "wget * | sh",
          "base64 * | sh",
          "eval",
        ],
      },
      files: {
        read: "allow",
        edit: "ask",
        delete: "deny",
      },
    },
  },
};

export const STRICT_COMPLIANCE_TEMPLATE: GovernanceTemplate = {
  id: "strict-compliance",
  name: "Strict Compliance",
  description: "Maximum safety for highly regulated environments.",
  frontmatter: {
    permissions: {
      shell: {
        default: "deny",
        allow: ["pnpm test", "pnpm build", "pnpm lint"],
      },
      files: {
        read: "ask",
        edit: "ask",
        delete: "deny",
      },
    },
    output_contract: {
      format: "json",
      schema: {
        summary: "string",
        success: "boolean",
      },
      quality_gates: ["0 errors", "0 warnings"],
      artifacts: ["*"],
      exit_criteria: ["success is true"],
    },
  },
};

export const CI_CD_STANDARD_TEMPLATE: GovernanceTemplate = {
  id: "ci-cd-standard",
  name: "CI/CD Standard",
  description: "Optimized for automated build and test pipelines.",
  frontmatter: {
    triggers: ["push", "pull_request"],
    permissions: {
      contents: "write",
      pull_requests: "write",
    },
  },
};

export const GOVERNANCE_TEMPLATES: GovernanceTemplate[] = [
  BASELINE_SECURITY_TEMPLATE,
  STRICT_COMPLIANCE_TEMPLATE,
  CI_CD_STANDARD_TEMPLATE,
];
