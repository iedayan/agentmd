/** AMD diagnostic rule codes per agentmd.online/docs/rules */
export const AMD_CODES = {
  AMD001: "Missing ## Build",
  AMD002: "Missing ## Test",
  AMD003: "Missing ## Lint",
  AMD004: "Empty command block",
  AMD005: "No frontmatter",
  AMD006: "Invalid YAML",
  AMD007: "Absolute path in command",
  AMD009: "Missing `name` in frontmatter",
  AMD010: "Missing `description` in frontmatter",
  AMD011: "Duplicate section",
  AMD012: "Env var not declared",
} as const;

export const RULE_DOC_BASE = "https://agentmd.online/docs/rules";
