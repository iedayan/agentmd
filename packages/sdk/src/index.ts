/**
 * @agentmd/sdk
 * Programmatic API for AgentMD integrations.
 * Re-exports @agentmd/core with a stable public API surface.
 */

export {
  parseAgentsMd,
  findSection,
  extractCommands,
  validateAgentsMd,
  discoverAgentsMd,
  findNearestAgentsMd,
} from "@agentmd-dev/core";

export type {
  ParsedAgentsMd,
  AgentsMdSection,
  ExtractedCommand,
  CommandType,
  DiscoveredAgentsMd,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "@agentmd-dev/core";
