/**
 * AgentMD Core Types
 * Types for parsing and working with AGENTS.md files per the standard.
 * @see https://agents.md
 */

import type { AgentsMdDirective } from "./schema.js";

/** A section extracted from AGENTS.md (heading + content) */
export interface AgentsMdSection {
  /** Heading level (1-6) */
  level: number;
  /** Section title (without # markers) */
  title: string;
  /** Raw heading line (e.g., "## Testing instructions") */
  heading: string;
  /** Content under this section (excluding subsections) */
  content: string;
  /** Child sections */
  children: AgentsMdSection[];
  /** Start line number in source */
  lineStart: number;
  /** End line number in source */
  lineEnd: number;
}

/** An executable command extracted from AGENTS.md */
export interface ExtractedCommand {
  /** The raw command string (e.g., "pnpm test") */
  command: string;
  /** Section where it was found */
  section: string;
  /** Line number in source */
  line: number;
  /** Inferred command type */
  type: CommandType;
  /** Optional context (e.g., "in codex-rs directory") */
  context?: string;
}

/** Common command categories for execution orchestration */
export type CommandType =
  | "build"
  | "test"
  | "lint"
  | "format"
  | "install"
  | "setup"
  | "deploy"
  | "security"
  | "other";

/** Result of parsing an AGENTS.md file */
export interface ParsedAgentsMd {
  /** Raw file content */
  raw: string;
  /** Extracted sections (flat for root-level) */
  sections: AgentsMdSection[];
  /** Extracted executable commands */
  commands: ExtractedCommand[];
  /** Total line count */
  lineCount: number;
  /** File path (if known) */
  filePath?: string;
  /** YAML frontmatter (agent config) if present */
  frontmatter?: import("./schema.js").AgentFrontmatter;
  /** Markdown directives (target, priority, etc.) */
  directives?: AgentsMdDirective[];
  /** Body content (without frontmatter) */
  body?: string;
}

/** Result of discovering AGENTS.md files in a repo */
export interface DiscoveredAgentsMd {
  /** Path relative to search root */
  path: string;
  /** Absolute path */
  absolutePath: string;
  /** Depth from root (0 = root AGENTS.md) */
  depth: number;
  /** Parsed content (optional, for convenience) */
  parsed?: ParsedAgentsMd;
}

/** Validation result for an AGENTS.md file */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  code: string;
  message: string;
  line?: number;
  severity: "error";
}

export interface ValidationWarning {
  code: string;
  message: string;
  line?: number;
  severity: "warning";
}
