/**
 * YAML Frontmatter Parser for AGENTS.md
 * Extracts and validates agent configuration from frontmatter.
 */

import matter from "gray-matter";
import type { AgentFrontmatter } from "./schema.js";

const FRONTMATTER_DELIMITER = "---";

/**
 * Parse frontmatter and body from AGENTS.md content.
 */
export function parseFrontmatter(content: string): {
  frontmatter: AgentFrontmatter;
  body: string;
  hasFrontmatter: boolean;
} {
  const parsed = matter(content, {
    delimiters: [FRONTMATTER_DELIMITER, FRONTMATTER_DELIMITER],
    excerpt: false,
  });

  const hasFrontmatter = parsed.data && Object.keys(parsed.data).length > 0;
  const frontmatter = normalizeFrontmatter(parsed.data as Record<string, unknown>);

  return {
    frontmatter,
    body: parsed.content,
    hasFrontmatter,
  };
}

/**
 * Normalize raw frontmatter data into AgentFrontmatter schema.
 * Supports both flat structure and nested `agent:` wrapper.
 */
function normalizeFrontmatter(data: Record<string, unknown>): AgentFrontmatter {
  const raw = (data.agent && typeof data.agent === "object"
    ? { ...data.agent }
    : data) as Record<string, unknown>;

  const result: AgentFrontmatter = {};

  if (typeof raw.name === "string") result.name = raw.name;
  if (typeof raw.purpose === "string") result.purpose = raw.purpose;
  if (typeof raw.model === "string") result.model = raw.model;
  if (typeof raw.description === "string") result.description = raw.description;

  if (Array.isArray(raw.triggers)) {
    result.triggers = raw.triggers.filter((t): t is string => typeof t === "string");
  }

  if (Array.isArray(raw.guardrails)) {
    result.guardrails = raw.guardrails.filter((g): g is string => typeof g === "string");
  }

  if (raw.permissions && typeof raw.permissions === "object") {
    result.permissions = raw.permissions as AgentFrontmatter["permissions"];
  }

  if (raw.metadata && typeof raw.metadata === "object" && !Array.isArray(raw.metadata)) {
    result.metadata = {};
    for (const [k, v] of Object.entries(raw.metadata)) {
      if (typeof v === "string") result.metadata[k] = v;
    }
  }

  if (raw.on && typeof raw.on === "object") {
    result.on = raw.on as Record<string, unknown>;
  }

  if (raw.output_contract && typeof raw.output_contract === "object") {
    const contract = raw.output_contract as Record<string, unknown>;
    const normalized: AgentFrontmatter["output_contract"] = {
      format: typeof contract.format === "string" ? contract.format : "json",
      schema:
        contract.schema && typeof contract.schema === "object" && !Array.isArray(contract.schema)
          ? Object.fromEntries(
              Object.entries(contract.schema).filter(
                (entry): entry is [string, string] => typeof entry[1] === "string"
              )
            )
          : {},
      quality_gates: Array.isArray(contract.quality_gates)
        ? contract.quality_gates.filter((g): g is string => typeof g === "string")
        : [],
      artifacts: Array.isArray(contract.artifacts)
        ? contract.artifacts.filter((a): a is string => typeof a === "string")
        : [],
      exit_criteria: Array.isArray(contract.exit_criteria)
        ? contract.exit_criteria.filter((c): c is string => typeof c === "string")
        : [],
    };
    result.output_contract = normalized;
  }

  return result;
}

/**
 * Stringify frontmatter and body back to AGENTS.md content.
 * Used for programmatic edits (e.g. improve command).
 */
export function stringifyAgentsMd(
  body: string,
  frontmatter?: Record<string, unknown> | null
): string {
  if (!frontmatter || Object.keys(frontmatter).length === 0) {
    return body;
  }
  return matter.stringify(body, frontmatter, {
    delimiters: [FRONTMATTER_DELIMITER, FRONTMATTER_DELIMITER],
  });
}
