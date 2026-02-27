/**
 * AGENTS.md Schema Types
 * YAML frontmatter schema for agent configuration.
 * Supports emerging standards from GitHub Agentic Workflows and agentsmd proposals.
 */

/** Permission level: allow, deny, or ask (human-in-the-loop) */
export type PermissionLevel = "allow" | "deny" | "ask";

/** File operation permissions */
export interface FilePermissions {
  read?: PermissionLevel;
  edit?: PermissionLevel;
  delete?: PermissionLevel;
}

/** Shell command permissions - allowlist or denylist */
export interface ShellPermissions {
  allow?: string[];
  deny?: string[];
  default?: "allow" | "deny";
}

/** Browser/URL access permissions */
export interface BrowserPermissions {
  allow?: string[];
  deny?: string[];
}

/** Structured permissions block (proposed in agentsmd/agents.md#105) */
export interface AgentPermissions {
  files?: FilePermissions;
  shell?: ShellPermissions;
  browser?: BrowserPermissions;
  /** GitHub-style: pull_requests, issues, contents, etc. */
  pull_requests?: "read" | "write" | "none";
  issues?: "read" | "write" | "none";
  contents?: "read" | "write" | "none";
}

/** Guardrail - natural language constraint */
export type Guardrail = string;

/** Risk level for commands — used for governance and audit */
export type CommandRiskLevel = "safe" | "read-only" | "write" | "dangerous";

/** Per-command metadata (declared in frontmatter) */
export interface CommandMetadata {
  /** Risk level — safe (read-only, no side effects), read-only, write (modifies files), dangerous (deploy, rm, etc.) */
  risk_level?: CommandRiskLevel;
  /** Preconditions that must be met before running (e.g. "tests pass", "approval") */
  preconditions?: string[];
  /** Audit tags for categorization (e.g. "build", "deploy", "migration") */
  audit_tags?: string[];
  /** Human-readable description */
  description?: string;
}

/** Command schema — maps command patterns to metadata. Key can be exact command or glob (e.g. "pnpm run *") */
export type CommandSchema = Record<string, CommandMetadata>;

/** Trigger event (GitHub-style) */
export type TriggerEvent =
  | "push"
  | "pull_request"
  | "pull_request.opened"
  | "pull_request.synchronize"
  | "issues"
  | "issues.opened"
  | "schedule"
  | "workflow_dispatch"
  | string;

/** Supported output formats for contract validation */
export type OutputContractFormat = "json" | "markdown" | "text";

/** Machine-checkable output contract for agent results */
export interface OutputContract {
  /** Expected output format */
  format: OutputContractFormat | string;
  /**
   * Required top-level output keys and primitive/object/array type expectations.
   * Example: { "summary": "string", "diff": "array" }
   */
  schema: Record<string, string>;
  /** Required quality gates that must pass in output.quality_gates */
  quality_gates: string[];
  /** Required artifacts (paths/ids) that must exist in output.artifacts */
  artifacts: string[];
  /** Required completion criteria that must pass in output.exit_criteria */
  exit_criteria: string[];
}

/** Agent configuration from YAML frontmatter */
export interface AgentFrontmatter {
  /** Agent identifier */
  name?: string;
  /** Human-readable purpose */
  purpose?: string;
  /** AI model to use (e.g., gpt-4o-mini, claude-3-sonnet) */
  model?: string;
  /** When this agent activates */
  triggers?: TriggerEvent[];
  /** Permission boundaries */
  permissions?: AgentPermissions;
  /** Natural language constraints - "Never modify code", "Never merge" */
  guardrails?: Guardrail[];
  /** Custom metadata */
  metadata?: Record<string, string>;
  /** GitHub Actions compatibility */
  on?: Record<string, unknown>;
  /** Description for workflow */
  description?: string;
  /** Required output contract for standardized agent responses */
  output_contract?: OutputContract;
  /** Per-command metadata: risk_level, preconditions, audit_tags. Key = command or pattern (e.g. "pnpm run deploy") */
  commands?: CommandSchema;
}

/** Markdown directive: <!-- agents-md: key=value --> */
export interface AgentsMdDirective {
  /** Raw directive text */
  raw: string;
  /** Line number */
  line: number;
  /** Parsed key-value pairs */
  params: Record<string, string>;
}

/** Directive parameter keys */
export type DirectiveKey = "target" | "priority" | "heading" | "import" | "globs";
