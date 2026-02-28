/**
 * YAML Frontmatter Parser for AGENTS.md
 * Extracts and validates agent configuration from frontmatter.
 */
import matter from 'gray-matter';
const FRONTMATTER_DELIMITER = '---';
/**
 * Parse frontmatter and body from AGENTS.md content.
 */
export function parseFrontmatter(content) {
  const parsed = matter(content, {
    delimiters: [FRONTMATTER_DELIMITER, FRONTMATTER_DELIMITER],
    excerpt: false,
  });
  const hasFrontmatter = parsed.data && Object.keys(parsed.data).length > 0;
  const frontmatter = normalizeFrontmatter(parsed.data);
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
function normalizeFrontmatter(data) {
  const raw = data.agent && typeof data.agent === 'object' ? { ...data.agent } : data;
  const result = {};
  if (typeof raw.name === 'string') result.name = raw.name;
  if (typeof raw.purpose === 'string') result.purpose = raw.purpose;
  if (typeof raw.model === 'string') result.model = raw.model;
  if (typeof raw.description === 'string') result.description = raw.description;
  if (Array.isArray(raw.triggers)) {
    result.triggers = raw.triggers.filter((t) => typeof t === 'string');
  }
  if (Array.isArray(raw.guardrails)) {
    result.guardrails = raw.guardrails.filter((g) => typeof g === 'string');
  }
  if (raw.permissions && typeof raw.permissions === 'object') {
    result.permissions = raw.permissions;
  }
  if (raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)) {
    result.metadata = {};
    for (const [k, v] of Object.entries(raw.metadata)) {
      if (typeof v === 'string') result.metadata[k] = v;
    }
  }
  if (raw.on && typeof raw.on === 'object') {
    result.on = raw.on;
  }
  if (raw.commands && typeof raw.commands === 'object' && !Array.isArray(raw.commands)) {
    const RISK_LEVELS = new Set(['safe', 'read-only', 'write', 'dangerous']);
    result.commands = {};
    for (const [key, val] of Object.entries(raw.commands)) {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const v = val;
        const meta = {};
        if (typeof v.risk_level === 'string' && RISK_LEVELS.has(v.risk_level)) {
          meta.risk_level = v.risk_level;
        }
        if (Array.isArray(v.preconditions)) {
          meta.preconditions = v.preconditions.filter((p) => typeof p === 'string');
        }
        if (Array.isArray(v.audit_tags)) {
          meta.audit_tags = v.audit_tags.filter((t) => typeof t === 'string');
        }
        if (typeof v.description === 'string') meta.description = v.description;
        if (Object.keys(meta).length > 0) result.commands[key] = meta;
      }
    }
  }
  if (raw.output_contract && typeof raw.output_contract === 'object') {
    const contract = raw.output_contract;
    const normalized = {
      format: typeof contract.format === 'string' ? contract.format : 'json',
      schema:
        contract.schema && typeof contract.schema === 'object' && !Array.isArray(contract.schema)
          ? Object.fromEntries(
              Object.entries(contract.schema).filter((entry) => typeof entry[1] === 'string'),
            )
          : {},
      quality_gates: Array.isArray(contract.quality_gates)
        ? contract.quality_gates.filter((g) => typeof g === 'string')
        : [],
      artifacts: Array.isArray(contract.artifacts)
        ? contract.artifacts.filter((a) => typeof a === 'string')
        : [],
      exit_criteria: Array.isArray(contract.exit_criteria)
        ? contract.exit_criteria.filter((c) => typeof c === 'string')
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
export function stringifyAgentsMd(body, frontmatter) {
  if (!frontmatter || Object.keys(frontmatter).length === 0) {
    return body;
  }
  return matter.stringify(body, frontmatter, {
    delimiters: [FRONTMATTER_DELIMITER, FRONTMATTER_DELIMITER],
  });
}
