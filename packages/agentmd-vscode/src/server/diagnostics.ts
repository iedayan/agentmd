/**
 * Maps @agentmd/core validation results to LSP diagnostics with AMD codes.
 */

import { parseAgentsMd, validateAgentsMd, type ParsedAgentsMd } from '@agentmd-dev/core';
import type { Diagnostic } from 'vscode-languageserver';
import { DiagnosticSeverity } from 'vscode-languageserver';
import { AMD_CODES, RULE_DOC_BASE } from '../shared/constants.js';

const ABSOLUTE_PATH_REGEX = /(?:^|\s)(\/[^\s]+|~\/[^\s]+|\b[A-Z]:\\[^\s]+)/;

/** Map core error/warning codes to AMD codes */
const CORE_TO_AMD: Record<string, string> = {
  EMPTY: 'AMD006',
  INVALID_NAME: 'AMD009',
  INVALID_DESCRIPTION: 'AMD010',
  INVALID_PURPOSE: 'AMD009',
  UNSAFE_COMMAND: 'AMD007',
};

/** Check if content is an AGENTS.md file (by path or content) */
export function isAgentsMd(uri: string): boolean {
  return uri.endsWith('AGENTS.md') || uri.endsWith('.agents.md') || false;
}

/** Parse and validate, returning diagnostics with AMD codes */
export async function getDiagnostics(
  content: string,
  uri: string,
): Promise<{ diagnostics: Diagnostic[]; parsed?: ParsedAgentsMd }> {
  const diagnostics: Diagnostic[] = [];
  let parsed: ParsedAgentsMd | undefined;

  try {
    parsed = parseAgentsMd(content, uri);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid YAML or parse error';
    diagnostics.push({
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
      message: msg,
      severity: DiagnosticSeverity.Error,
      code: 'AMD006',
      source: 'AgentMD',
      codeDescription: { href: `${RULE_DOC_BASE}/AMD006` },
    });
    return { diagnostics, parsed: undefined };
  }

  const result = await validateAgentsMd(parsed);

  // AMD001: Missing ## Build
  const sectionTitles = getAllSectionTitles(parsed.sections).map((t) => t.toLowerCase());
  if (!sectionTitles.some((t) => t.includes('build'))) {
    diagnostics.push(createDiagnostic(0, 0, 'AMD001', 'Missing ## Build section', 'error'));
  }

  // AMD002: Missing ## Test
  if (!sectionTitles.some((t) => t.includes('test'))) {
    diagnostics.push(createDiagnostic(0, 0, 'AMD002', 'Missing ## Test section', 'error'));
  }

  // AMD003: Missing ## Lint
  if (!sectionTitles.some((t) => t.includes('lint'))) {
    diagnostics.push(createDiagnostic(0, 0, 'AMD003', 'Missing ## Lint section', 'warning'));
  }

  // AMD004: Empty command blocks
  const emptyBlocks = findEmptyCommandBlocks(content);
  for (const { line } of emptyBlocks) {
    diagnostics.push(createDiagnostic(line - 1, 0, 'AMD004', AMD_CODES.AMD004, 'error'));
  }

  // AMD005: No frontmatter
  if (parsed.raw.trim() && !parsed.frontmatter && !content.trimStart().startsWith('---')) {
    diagnostics.push(createDiagnostic(0, 0, 'AMD005', AMD_CODES.AMD005, 'warning'));
  }

  // AMD007: Absolute path in command
  for (const cmd of parsed.commands) {
    if (ABSOLUTE_PATH_REGEX.test(cmd.command)) {
      diagnostics.push(createDiagnostic(cmd.line - 1, 0, 'AMD007', AMD_CODES.AMD007, 'warning'));
    }
  }

  // AMD009, AMD010: from core frontmatter validation
  for (const err of result.errors) {
    const amd = CORE_TO_AMD[err.code] ?? (err.code.startsWith('INVALID_') ? 'AMD009' : 'AMD006');
    const line = err.line ?? 0;
    diagnostics.push(createDiagnostic(line > 0 ? line - 1 : 0, 0, amd, err.message, 'error'));
  }

  // AMD011: Duplicate section (case-insensitive)
  const flatSections = flattenSections(parsed.sections);
  const seen = new Map<string, number>();
  for (const section of flatSections) {
    const key = section.title.toLowerCase();
    if (seen.has(key)) {
      diagnostics.push(
        createDiagnostic(
          section.lineStart - 1,
          0,
          'AMD011',
          `Duplicate section: ## ${section.title}`,
          'error',
        ),
      );
    } else {
      seen.set(key, section.lineStart);
    }
  }

  // Map core warnings
  for (const w of result.warnings) {
    const amd = CORE_TO_AMD[w.code] ?? 'AMD007';
    const line = w.line ?? 0;
    diagnostics.push(createDiagnostic(line > 0 ? line - 1 : 0, 0, amd, w.message, 'warning'));
  }

  return { diagnostics, parsed };
}

function getAllSectionTitles(sections: import('@agentmd-dev/core').AgentsMdSection[]): string[] {
  return flattenSections(sections).map((s) => s.title);
}

function flattenSections(
  sections: import('@agentmd-dev/core').AgentsMdSection[],
): import('@agentmd-dev/core').AgentsMdSection[] {
  const out: import('@agentmd-dev/core').AgentsMdSection[] = [];
  const visit = (s: import('@agentmd-dev/core').AgentsMdSection) => {
    out.push(s);
    s.children.forEach(visit);
  };
  sections.forEach(visit);
  return out;
}

function findEmptyCommandBlocks(content: string): { line: number }[] {
  const results: { line: number }[] = [];
  const lines = content.split('\n');
  let inBlock = false;
  let blockStart = 0;
  let blockContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (inBlock) {
        if (!blockContent.trim()) {
          results.push({ line: blockStart + 1 });
        }
        inBlock = false;
        blockContent = '';
      } else {
        inBlock = true;
        blockStart = i;
        blockContent = '';
      }
    } else if (inBlock) {
      blockContent += line + '\n';
    }
  }

  return results;
}

function createDiagnostic(
  line: number,
  char: number,
  code: string,
  message: string,
  severity: 'error' | 'warning',
): Diagnostic {
  return {
    range: {
      start: { line, character: char },
      end: { line, character: char + 1 },
    },
    message,
    severity: severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
    code,
    source: 'AgentMD',
    codeDescription: { href: `${RULE_DOC_BASE}/${code}` },
  };
}
