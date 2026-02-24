/**
 * Policy-as-Code - Define rules in YAML
 * Guardrails enforcement at runtime.
 */

import matter from "gray-matter";

export type ApprovalRequirement = "always" | "on_failure" | "high_risk" | "never";

export interface PolicyRule {
  id: string;
  name: string;
  description?: string;
  /** Command pattern to match (glob or regex) */
  match: string;
  /** Require human approval before execution */
  approval: ApprovalRequirement;
  /** Escalation: who to notify when confidence is low */
  escalateTo?: string[];
  /** Cost budget in execution minutes */
  budgetMinutes?: number;
}

export interface PolicyConfig {
  version: "1";
  rules: PolicyRule[];
  /** Default approval for unmatched commands */
  defaultApproval?: ApprovalRequirement;
}

const APPROVAL_REQUIREMENTS: readonly ApprovalRequirement[] = [
  "always",
  "on_failure",
  "high_risk",
  "never",
];

/**
 * Example policy YAML:
 * version: "1", defaultApproval: ask
 * rules: id/deploy match glob, approval always, escalateTo, budgetMinutes
 */
export function parsePolicyConfig(yaml: string): PolicyConfig {
  const wrapped = `---\n${yaml.trim()}\n---\n`;
  const raw = matter(wrapped).data;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid policy: expected a YAML object");
  }

  const parsed = raw as Record<string, unknown>;
  if (parsed.version !== "1") {
    throw new Error("Invalid policy: version must be \"1\"");
  }

  if (
    parsed.defaultApproval !== undefined &&
    !isApprovalRequirement(parsed.defaultApproval)
  ) {
    throw new Error(
      "Invalid policy: defaultApproval must be always, on_failure, high_risk, or never"
    );
  }

  if (!Array.isArray(parsed.rules) || parsed.rules.length === 0) {
    throw new Error("Invalid policy: rules array required");
  }

  const ids = new Set<string>();
  const rules: PolicyRule[] = parsed.rules.map((item, index) =>
    validatePolicyRule(item, index, ids)
  );

  return {
    version: "1",
    rules,
    defaultApproval: parsed.defaultApproval as ApprovalRequirement | undefined,
  };
}

function validatePolicyRule(
  raw: unknown,
  index: number,
  ids: Set<string>
): PolicyRule {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`Invalid policy rule at index ${index}: expected object`);
  }

  const rule = raw as Record<string, unknown>;
  const id = requireNonEmptyString(rule.id, `rules[${index}].id`);
  if (ids.has(id)) {
    throw new Error(`Invalid policy: duplicate rule id "${id}"`);
  }
  ids.add(id);

  const name = requireNonEmptyString(rule.name, `rules[${index}].name`);
  const match = requireNonEmptyString(rule.match, `rules[${index}].match`);

  if (!isApprovalRequirement(rule.approval)) {
    throw new Error(
      `Invalid policy rule "${id}": approval must be always, on_failure, high_risk, or never`
    );
  }

  let escalateTo: string[] | undefined;
  if (rule.escalateTo !== undefined) {
    if (!Array.isArray(rule.escalateTo)) {
      throw new Error(`Invalid policy rule "${id}": escalateTo must be an array of strings`);
    }
    const validated = rule.escalateTo.map((v, i) =>
      requireNonEmptyString(v, `rules[${index}].escalateTo[${i}]`)
    );
    if (validated.length === 0) {
      throw new Error(`Invalid policy rule "${id}": escalateTo must not be empty`);
    }
    escalateTo = validated;
  }

  let budgetMinutes: number | undefined;
  if (rule.budgetMinutes !== undefined) {
    if (
      typeof rule.budgetMinutes !== "number" ||
      !Number.isFinite(rule.budgetMinutes) ||
      !Number.isInteger(rule.budgetMinutes) ||
      rule.budgetMinutes <= 0
    ) {
      throw new Error(
        `Invalid policy rule "${id}": budgetMinutes must be a positive integer`
      );
    }
    budgetMinutes = rule.budgetMinutes;
  }

  const description =
    rule.description === undefined
      ? undefined
      : requireNonEmptyString(rule.description, `rules[${index}].description`);

  return {
    id,
    name,
    description,
    match,
    approval: rule.approval,
    escalateTo,
    budgetMinutes,
  };
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid policy: ${field} must be a non-empty string`);
  }
  return value.trim();
}

function isApprovalRequirement(value: unknown): value is ApprovalRequirement {
  return (
    typeof value === "string" &&
    APPROVAL_REQUIREMENTS.includes(value as ApprovalRequirement)
  );
}

/**
 * Test if a command matches a glob or regex pattern.
 * - Glob: * = any chars, ? = single char (e.g. "deploy:*", "pnpm *")
 * - Regex: prefix with "regex:" or "re:" (e.g. "regex:^deploy\\s+prod")
 */
function matchesPattern(command: string, pattern: string): boolean {
  const normalized = command.toLowerCase().trim();
  const patternTrimmed = pattern.trim();

  if (patternTrimmed.startsWith("regex:") || patternTrimmed.startsWith("re:")) {
    const reStr = patternTrimmed.replace(/^(?:regex|re):/i, "").trim();
    try {
      const re = new RegExp(reStr, "i");
      return re.test(normalized);
    } catch {
      return false;
    }
  }

  // Glob: escape regex special chars, then * -> .*, ? -> .
  const globRe = patternTrimmed
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  try {
    return new RegExp(`^${globRe}$`, "i").test(normalized);
  } catch {
    return false;
  }
}

/**
 * Find the first policy rule that matches a command.
 * Rules are checked in order; first match wins.
 */
export function matchCommandToRule(
  command: string,
  config: PolicyConfig
): PolicyRule | undefined {
  for (const rule of config.rules) {
    if (matchesPattern(command, rule.match)) {
      return rule;
    }
  }
  return undefined;
}

/**
 * Get the approval requirement for a command based on policy.
 * Returns the matched rule's approval, or defaultApproval, or "never" if unset.
 */
export function getApprovalRequirement(
  command: string,
  config: PolicyConfig
): { requirement: ApprovalRequirement; rule?: PolicyRule } {
  const rule = matchCommandToRule(command, config);
  if (rule) {
    return { requirement: rule.approval, rule };
  }
  return {
    requirement: config.defaultApproval ?? "never",
  };
}
