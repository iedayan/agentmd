/**
 * @agentmd/core
 * AGENTS.md parsing, validation, discovery, composition, and execution.
 */
export * from './types.js';
export * from './schema.js';
// Experimental modules (public, limited semver guarantees pre-1.0):
export * from './enterprise/index.js';
export * from './marketplace/index.js';
export { parseAgentsMd, findSection } from './parser.js';
export { extractCommands, getSuggestedExecutionOrder } from './commands.js';
export { validateAgentsMd, computeAgentReadinessScore } from './validator.js';
export { validateOutputAgainstContract } from './output-contract.js';
export { discoverAgentsMd, findNearestAgentsMd } from './discovery.js';
export { parseFrontmatter, stringifyAgentsMd } from './frontmatter.js';
export { parseDirectives, getDirectiveTarget, getDirectivePriority } from './directives.js';
export { discoverFragments, composeAgentsMd, loadComposeConfig } from './compose.js';
export {
  executeCommand,
  executeCommands,
  executeCommandsParallel,
  planCommandExecutions,
  isCommandSafe,
  isCommandAllowed,
  requiresShellFeatures,
} from './executor.js';
export { exportToGitHubActions } from './ci-export.js';
export { toOtelTrace, toOtlpJson } from './otel.js';
export {
  GOVERNANCE_TEMPLATES,
  BASELINE_SECURITY_TEMPLATE,
  STRICT_COMPLIANCE_TEMPLATE,
  CI_CD_STANDARD_TEMPLATE,
  getTemplateById,
} from './templates.js';
export {
  analytics,
  initializeAnalytics,
  getAnalytics,
  track,
  AnalyticsClient,
} from './analytics.js';
