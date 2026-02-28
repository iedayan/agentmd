/**
 * Markdown Directives Parser for AGENTS.md
 * Extracts <!-- agents-md: key=value --> style directives.
 * @see https://github.com/ivawzh/agents-md
 */

import type { AgentsMdDirective } from './schema.js';

/**
 * Parse all agents-md directives from content.
 */
export function parseDirectives(content: string): AgentsMdDirective[] {
  const directives: AgentsMdDirective[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/<!--\s*agents-md:\s*([^>]+)\s*-->/i);
    if (match) {
      const params = parseDirectiveParams(match[1]);
      directives.push({
        raw: match[0],
        line: i + 1,
        params,
      });
    }
  }

  return directives;
}

/**
 * Parse directive params: "target=nearest, priority=1" -> { target: "nearest", priority: "1" }
 */
function parseDirectiveParams(content: string): Record<string, string> {
  const params: Record<string, string> = {};
  const parts = content.split(/[\s,]+/).filter(Boolean);

  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq > 0) {
      const key = part.slice(0, eq).trim();
      const value = part
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      params[key] = value;
    }
  }

  return params;
}

/**
 * Get target from directives: "nearest" | "root" | path.
 * First directive wins.
 */
export function getDirectiveTarget(directives: AgentsMdDirective[]): string | undefined {
  return directives.find((d) => d.params.target)?.params.target;
}

/**
 * Get priority for ordering (higher = earlier). Default 0.
 */
export function getDirectivePriority(directives: AgentsMdDirective[]): number {
  const p = directives.find((d) => d.params.priority)?.params.priority;
  return p ? parseInt(p, 10) || 0 : 0;
}
