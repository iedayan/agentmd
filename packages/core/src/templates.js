/**
 * Governance Templates
 * Pre-built governance and security configurations for AgentMD.
 */
export const BASELINE_SECURITY_TEMPLATE = {
  id: 'baseline-security',
  name: 'Baseline Security',
  description: 'Recommended minimal security posture for most projects.',
  frontmatter: {
    permissions: {
      shell: {
        deny: ['rm -rf /', 'sudo', 'su -', 'curl * | sh', 'wget * | sh', 'base64 * | sh', 'eval'],
      },
      files: {
        read: 'allow',
        edit: 'ask',
        delete: 'deny',
      },
    },
  },
};
export const STRICT_COMPLIANCE_TEMPLATE = {
  id: 'strict-compliance',
  name: 'Strict Compliance',
  description: 'Maximum safety for highly regulated environments.',
  frontmatter: {
    permissions: {
      shell: {
        default: 'deny',
        allow: ['pnpm test', 'pnpm build', 'pnpm lint'],
      },
      files: {
        read: 'ask',
        edit: 'ask',
        delete: 'deny',
      },
    },
    output_contract: {
      format: 'json',
      schema: {
        summary: 'string',
        success: 'boolean',
      },
      quality_gates: ['0 errors', '0 warnings'],
      artifacts: ['*'],
      exit_criteria: ['success is true'],
    },
  },
};
export const CI_CD_STANDARD_TEMPLATE = {
  id: 'ci-cd-standard',
  name: 'CI/CD Standard',
  description: 'Optimized for automated build and test pipelines.',
  frontmatter: {
    triggers: ['push', 'pull_request'],
    permissions: {
      contents: 'write',
      pull_requests: 'write',
    },
  },
};
export const GOVERNANCE_TEMPLATES = [
  BASELINE_SECURITY_TEMPLATE,
  STRICT_COMPLIANCE_TEMPLATE,
  CI_CD_STANDARD_TEMPLATE,
];
export function getTemplateById(id) {
  return GOVERNANCE_TEMPLATES.find((t) => t.id === id);
}
