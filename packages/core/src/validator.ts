/**
 * AGENTS.md Validator
 * Validates AGENTS.md files against the standard and best practices.
 * Includes command safety checks and agent-readiness scoring.
 * @see https://agents.md
 */

import type {
  ParsedAgentsMd,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  AgentsMdSection,
} from './types.js';
import { isCommandSafe } from './executor.js';

const RECOMMENDED_SECTIONS = [
  'testing',
  'test',
  'build',
  'pr',
  'pull request',
  'commit',
  'security',
  'code style',
  'conventions',
  'architecture',
  'deploy',
  'deployment',
  'setup',
  'install',
];

const MAX_LINES_RECOMMENDED = 150;
const PERMISSION_LEVELS = new Set(['allow', 'deny', 'ask']);
const SHELL_DEFAULTS = new Set(['allow', 'deny']);
const RESOURCE_PERMISSION_LEVELS = new Set(['read', 'write', 'none']);
const OUTPUT_CONTRACT_FORMATS = new Set(['json', 'markdown', 'text']);
const OUTPUT_SCHEMA_TYPES = new Set([
  'string',
  'number',
  'boolean',
  'object',
  'array',
  'null',
  'any',
]);

export interface ValidationOptions {
  requireOutputContract?: boolean;
}

/**
 * Validate a parsed AGENTS.md file.
 */
export async function validateAgentsMd(
  parsed: ParsedAgentsMd,
  options?: ValidationOptions,
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  // Required: must have content
  if (!parsed.raw.trim()) {
    errors.push({
      code: 'EMPTY',
      message: 'AGENTS.md must not be empty',
      line: 1,
      severity: 'error',
    });
  }

  // Recommended: under 150 lines
  if (parsed.lineCount > MAX_LINES_RECOMMENDED) {
    warnings.push({
      code: 'LONG_FILE',
      message: `AGENTS.md has ${parsed.lineCount} lines; the standard recommends keeping it under ${MAX_LINES_RECOMMENDED} for brevity`,
      severity: 'warning',
    });
    suggestions.push('Consider moving detailed instructions to linked documentation.');
  }

  // Recommended: has sections
  if (parsed.sections.length === 0 && parsed.raw.trim()) {
    warnings.push({
      code: 'NO_SECTIONS',
      message: 'AGENTS.md has no markdown headings; consider adding sections for structure',
      severity: 'warning',
    });
    suggestions.push(
      'Add sections like ## Testing instructions, ## Build commands, ## PR guidelines',
    );
  }

  // Check for recommended section coverage
  const sectionTitles = getAllSectionTitles(parsed.sections).map((t) => t.toLowerCase());
  const hasRecommended = RECOMMENDED_SECTIONS.some((rec) =>
    sectionTitles.some((t) => t.includes(rec)),
  );
  if (!hasRecommended && parsed.sections.length > 0) {
    suggestions.push(
      'Consider adding: Testing instructions, Build commands, PR/commit guidelines, or Code style.',
    );
  }

  // Check for executable commands (best practice: 3-5 commands per agentsmd.io)
  const cmdCount = parsed.commands.length;
  if (cmdCount === 0 && parsed.sections.length > 0) {
    suggestions.push(
      'No executable commands detected. Add commands in backticks (e.g., `pnpm test`) for AgentMD to orchestrate.',
    );
  } else if (cmdCount > 0 && cmdCount < 3) {
    suggestions.push(
      'Consider adding 3-5 executable commands for optimal agent effectiveness (build, test, lint).',
    );
  } else if (cmdCount > 10) {
    suggestions.push(
      'Consider reducing to 3-5 core commands; excessive commands may reduce agent focus and effectiveness.',
    );
  }

  // File-scoped commands: suggest when 4+ project-wide commands (best practice per agentsmd.io)
  const hasFileScoped = parsed.commands.some(
    (c) => c.command.includes('--') || /\b(?:src|lib|packages)\/[\w./-]+\b/.test(c.command),
  );
  if (parsed.commands.length >= 4 && !hasFileScoped) {
    suggestions.push(
      'Consider file-scoped commands for single-file validation (e.g., type-check or lint on changed files only).',
    );
  }

  // Frontmatter schema validation
  if (parsed.frontmatter) {
    const fmErrors = validateFrontmatterSchema(parsed.frontmatter);
    errors.push(...fmErrors);
  }
  if (options?.requireOutputContract && !parsed.frontmatter?.output_contract) {
    errors.push({
      code: 'MISSING_OUTPUT_CONTRACT',
      message:
        'frontmatter.output_contract is required (fields: format, schema, quality_gates, artifacts, exit_criteria)',
      line: 1,
      severity: 'error',
    });
  }

  // Conflicting directives
  if (parsed.directives && parsed.directives.length > 1) {
    const conflicts = checkDirectiveConflicts(parsed.directives);
    warnings.push(...conflicts);
  }

  // Command safety checks
  for (const cmd of parsed.commands) {
    const safe = await isCommandSafe(cmd.command);
    if (!safe.safe) {
      errors.push({
        code: 'UNSAFE_COMMAND',
        message: `Dangerous command blocked: ${cmd.command}`,
        line: cmd.line,
        severity: 'error',
      });
    }
  }

  // Suggest risk_level for deploy/high-impact commands (safe command schema)
  const commandsSchema = parsed.frontmatter?.commands;
  const deployOrHighImpact = parsed.commands.filter(
    (c) =>
      c.type === 'deploy' ||
      /\b(deploy|migrate|release|publish|kubectl|helm|terraform\s+apply)\b/i.test(c.command),
  );
  if (
    deployOrHighImpact.length > 0 &&
    (!commandsSchema || Object.keys(commandsSchema).length === 0)
  ) {
    suggestions.push(
      'Add frontmatter.commands with risk_level for deploy/migrate commands (e.g. risk_level: dangerous, preconditions: ["tests pass"])',
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Agent-readiness score weights (0-100 total).
 * Calibrated for typical AGENTS.md best practices.
 */
const SCORE_WEIGHTS = {
  hasContent: 8,
  hasSections: 18,
  hasCommands: 22,
  hasFrontmatter: 12,
  hasFrontmatterDetail: 3,
  hasTestingSection: 5,
  hasBuildSection: 5,
  hasPRSection: 4,
  hasDeploySection: 3,
  hasInstallSection: 3,
  hasSecurityOrArchSection: 4,
  hasMultipleCommandTypes: 6,
  hasGuardrails: 4,
  allCommandsSafe: 12,
} as const;

/**
 * Compute agent-readiness score (0-100).
 * Based on: sections, commands, frontmatter, safety.
 */
export async function computeAgentReadinessScore(parsed: ParsedAgentsMd): Promise<number> {
  let score = 0;
  const max = 100;

  if (parsed.raw.trim()) score += SCORE_WEIGHTS.hasContent;
  if (parsed.sections.length > 0) score += SCORE_WEIGHTS.hasSections;
  if (parsed.commands.length > 0) score += SCORE_WEIGHTS.hasCommands;
  if (parsed.frontmatter && Object.keys(parsed.frontmatter).length > 0) {
    score += SCORE_WEIGHTS.hasFrontmatter;
  }
  const hasFrontmatterDetail =
    parsed.frontmatter &&
    (isNonEmptyString(parsed.frontmatter.name) ||
      isNonEmptyString(parsed.frontmatter.purpose) ||
      (Array.isArray(parsed.frontmatter.triggers) && parsed.frontmatter.triggers.length > 0));
  if (hasFrontmatterDetail) score += SCORE_WEIGHTS.hasFrontmatterDetail;

  const sectionTitles = getAllSectionTitles(parsed.sections).map((t) => t.toLowerCase());
  const hasTesting = sectionTitles.some((t) => t.includes('test'));
  const hasBuild = sectionTitles.some((t) => t.includes('build'));
  const hasPR = sectionTitles.some((t) => t.includes('pr') || t.includes('pull request'));
  const hasDeploy = sectionTitles.some((t) => t.includes('deploy'));
  const hasInstall = sectionTitles.some((t) => t.includes('install') || t.includes('setup'));
  const hasSecurityOrArch = sectionTitles.some(
    (t) => t.includes('security') || t.includes('architecture'),
  );
  if (hasTesting) score += SCORE_WEIGHTS.hasTestingSection;
  if (hasBuild) score += SCORE_WEIGHTS.hasBuildSection;
  if (hasPR) score += SCORE_WEIGHTS.hasPRSection;
  if (hasDeploy) score += SCORE_WEIGHTS.hasDeploySection;
  if (hasInstall) score += SCORE_WEIGHTS.hasInstallSection;
  if (hasSecurityOrArch) score += SCORE_WEIGHTS.hasSecurityOrArchSection;

  // Bonus for multiple command types (build + test + lint, etc.)
  const types = new Set(parsed.commands.map((c) => c.type).filter((t) => t !== 'other'));
  if (types.size >= 2) score += SCORE_WEIGHTS.hasMultipleCommandTypes;

  // Bonus for guardrails in frontmatter
  const hasGuardrails = parsed.frontmatter?.guardrails && parsed.frontmatter.guardrails.length > 0;
  if (hasGuardrails) score += SCORE_WEIGHTS.hasGuardrails;

  const safetyResults = await Promise.all(parsed.commands.map((c) => isCommandSafe(c.command)));
  const allSafe = safetyResults.every((r) => r.safe);
  if (parsed.commands.length === 0 || allSafe) score += SCORE_WEIGHTS.allCommandsSafe;

  // Penalty: unsafe commands (already blocked, but deduct from score)
  const unsafeCount = safetyResults.filter((r) => !r.safe).length;
  if (unsafeCount > 0) score -= Math.min(unsafeCount * 10, 25);

  // Penalty: sections but no commands (documentation without executable instructions)
  if (parsed.sections.length > 0 && parsed.commands.length === 0) score -= 5;

  // Penalty: very long files (recommended under 150 lines)
  if (parsed.lineCount > MAX_LINES_RECOMMENDED) score -= 5;

  return Math.max(0, Math.min(score, max));
}

function getAllSectionTitles(sections: AgentsMdSection[]): string[] {
  const titles: string[] = [];
  const visit = (s: AgentsMdSection) => {
    titles.push(s.title);
    s.children.forEach(visit);
  };
  sections.forEach(visit);
  return titles;
}

function validateFrontmatterSchema(
  fm: import('./schema.js').AgentFrontmatter,
): import('./types.js').ValidationError[] {
  const errs: import('./types.js').ValidationError[] = [];
  if (fm.name !== undefined && !isNonEmptyString(fm.name)) {
    errs.push({
      code: 'INVALID_NAME',
      message: 'frontmatter.name must be a non-empty string',
      severity: 'error',
    });
  }
  if (fm.purpose !== undefined && !isNonEmptyString(fm.purpose)) {
    errs.push({
      code: 'INVALID_PURPOSE',
      message: 'frontmatter.purpose must be a non-empty string',
      severity: 'error',
    });
  }
  if (fm.model !== undefined && !isNonEmptyString(fm.model)) {
    errs.push({
      code: 'INVALID_MODEL',
      message: 'frontmatter.model must be a non-empty string',
      severity: 'error',
    });
  }
  if (fm.description !== undefined && !isNonEmptyString(fm.description)) {
    errs.push({
      code: 'INVALID_DESCRIPTION',
      message: 'frontmatter.description must be a non-empty string',
      severity: 'error',
    });
  }

  if (fm.triggers && Array.isArray(fm.triggers)) {
    for (let i = 0; i < fm.triggers.length; i++) {
      const t = fm.triggers[i];
      if (!isNonEmptyString(t)) {
        errs.push({
          code: 'INVALID_TRIGGER',
          message: `triggers[${i}] must be a non-empty string`,
          severity: 'error',
        });
        continue;
      }
      if (!/^[a-z0-9._-]+$/i.test(t)) {
        errs.push({
          code: 'INVALID_TRIGGER_FORMAT',
          message: `triggers[${i}] has invalid format "${t}" (use alphanumeric, dot, underscore, hyphen)`,
          severity: 'error',
        });
      }
    }
  }

  if (fm.guardrails) {
    if (!Array.isArray(fm.guardrails)) {
      errs.push({
        code: 'INVALID_GUARDRAILS',
        message: 'guardrails must be an array of non-empty strings',
        severity: 'error',
      });
    } else {
      for (let i = 0; i < fm.guardrails.length; i++) {
        if (!isNonEmptyString(fm.guardrails[i])) {
          errs.push({
            code: 'INVALID_GUARDRAIL',
            message: `guardrails[${i}] must be a non-empty string`,
            severity: 'error',
          });
        }
      }
    }
  }

  if (fm.permissions?.shell?.default && !SHELL_DEFAULTS.has(fm.permissions.shell.default)) {
    errs.push({
      code: 'INVALID_SHELL_DEFAULT',
      message: "permissions.shell.default must be 'allow' or 'deny'",
      severity: 'error',
    });
  }
  const files = fm.permissions?.files;
  if (files) {
    const fields: Array<keyof typeof files> = ['read', 'edit', 'delete'];
    for (const field of fields) {
      const value = files[field];
      if (value !== undefined && !PERMISSION_LEVELS.has(value)) {
        errs.push({
          code: 'INVALID_FILE_PERMISSION',
          message: `permissions.files.${field} must be allow, deny, or ask`,
          severity: 'error',
        });
      }
    }
  }

  const shell = fm.permissions?.shell;
  if (shell?.allow !== undefined && !isStringArray(shell.allow)) {
    errs.push({
      code: 'INVALID_SHELL_ALLOW',
      message: 'permissions.shell.allow must be an array of non-empty strings',
      severity: 'error',
    });
  }
  if (shell?.deny !== undefined && !isStringArray(shell.deny)) {
    errs.push({
      code: 'INVALID_SHELL_DENY',
      message: 'permissions.shell.deny must be an array of non-empty strings',
      severity: 'error',
    });
  }

  const browser = fm.permissions?.browser;
  if (browser?.allow !== undefined && !isStringArray(browser.allow)) {
    errs.push({
      code: 'INVALID_BROWSER_ALLOW',
      message: 'permissions.browser.allow must be an array of non-empty strings',
      severity: 'error',
    });
  }
  if (browser?.deny !== undefined && !isStringArray(browser.deny)) {
    errs.push({
      code: 'INVALID_BROWSER_DENY',
      message: 'permissions.browser.deny must be an array of non-empty strings',
      severity: 'error',
    });
  }

  const resources: Array<'pull_requests' | 'issues' | 'contents'> = [
    'pull_requests',
    'issues',
    'contents',
  ];
  for (const resource of resources) {
    const value = fm.permissions?.[resource];
    if (value !== undefined && !RESOURCE_PERMISSION_LEVELS.has(value)) {
      errs.push({
        code: 'INVALID_RESOURCE_PERMISSION',
        message: `permissions.${resource} must be read, write, or none`,
        severity: 'error',
      });
    }
  }

  if (fm.metadata !== undefined) {
    if (!fm.metadata || typeof fm.metadata !== 'object' || Array.isArray(fm.metadata)) {
      errs.push({
        code: 'INVALID_METADATA',
        message: 'metadata must be a string-to-string object',
        severity: 'error',
      });
    } else {
      for (const [key, value] of Object.entries(fm.metadata)) {
        if (!isNonEmptyString(key) || !isNonEmptyString(value)) {
          errs.push({
            code: 'INVALID_METADATA_ENTRY',
            message: 'metadata keys and values must be non-empty strings',
            severity: 'error',
          });
          break;
        }
      }
    }
  }

  if (fm.output_contract !== undefined) {
    const contract = fm.output_contract;
    const contractRecord = contract as unknown as Record<string, unknown>;
    const required = ['format', 'schema', 'quality_gates', 'artifacts', 'exit_criteria'] as const;
    for (const field of required) {
      if (contractRecord[field] === undefined) {
        errs.push({
          code: 'MISSING_OUTPUT_CONTRACT_FIELD',
          message: `output_contract.${field} is required`,
          severity: 'error',
        });
      }
    }

    if (
      contract.format !== undefined &&
      !OUTPUT_CONTRACT_FORMATS.has(String(contract.format).toLowerCase())
    ) {
      errs.push({
        code: 'INVALID_OUTPUT_CONTRACT_FORMAT',
        message: 'output_contract.format must be one of: json, markdown, text',
        severity: 'error',
      });
    }

    if (!contract.schema || typeof contract.schema !== 'object' || Array.isArray(contract.schema)) {
      errs.push({
        code: 'INVALID_OUTPUT_CONTRACT_SCHEMA',
        message: 'output_contract.schema must be an object of key -> type',
        severity: 'error',
      });
    } else {
      for (const [key, type] of Object.entries(contract.schema)) {
        if (!isNonEmptyString(key) || !isNonEmptyString(type)) {
          errs.push({
            code: 'INVALID_OUTPUT_CONTRACT_SCHEMA_ENTRY',
            message: 'output_contract.schema keys and values must be non-empty strings',
            severity: 'error',
          });
          break;
        }
        if (!OUTPUT_SCHEMA_TYPES.has(type.toLowerCase())) {
          errs.push({
            code: 'INVALID_OUTPUT_CONTRACT_SCHEMA_TYPE',
            message: `output_contract.schema.${key} has unsupported type "${type}" (allowed: ${Array.from(OUTPUT_SCHEMA_TYPES).join(', ')})`,
            severity: 'error',
          });
          break;
        }
      }
    }

    if (!isStringArray(contract.quality_gates)) {
      errs.push({
        code: 'INVALID_OUTPUT_CONTRACT_QUALITY_GATES',
        message: 'output_contract.quality_gates must be an array of non-empty strings',
        severity: 'error',
      });
    }

    if (!isStringArray(contract.artifacts)) {
      errs.push({
        code: 'INVALID_OUTPUT_CONTRACT_ARTIFACTS',
        message: 'output_contract.artifacts must be an array of non-empty strings',
        severity: 'error',
      });
    }

    if (!isStringArray(contract.exit_criteria)) {
      errs.push({
        code: 'INVALID_OUTPUT_CONTRACT_EXIT_CRITERIA',
        message: 'output_contract.exit_criteria must be an array of non-empty strings',
        severity: 'error',
      });
    }
  }

  return errs;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string' && item.trim().length > 0)
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function checkDirectiveConflicts(
  directives: import('./schema.js').AgentsMdDirective[],
): import('./types.js').ValidationWarning[] {
  const warnings: import('./types.js').ValidationWarning[] = [];
  const targets = directives.filter((d) => d.params.target).map((d) => d.params.target);
  if (targets.length > 1 && new Set(targets).size > 1) {
    warnings.push({
      code: 'CONFLICTING_TARGETS',
      message: `Multiple target directives: ${targets.join(', ')}; first wins`,
      severity: 'warning',
    });
  }
  return warnings;
}
