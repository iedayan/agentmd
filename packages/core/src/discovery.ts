/**
 * AGENTS.md Discovery
 * Finds AGENTS.md files in a repository, including nested files in monorepos.
 * Per the standard: agents read the nearest AGENTS.md (like .gitignore resolution).
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve, relative, dirname } from "path";
import type { DiscoveredAgentsMd } from "./types.js";
import { parseAgentsMd } from "./parser.js";

const AGENTS_MD_FILENAME = "AGENTS.md";

/**
 * Discover all AGENTS.md files under a directory.
 * Returns paths sorted by depth (root first), then alphabetically.
 */
export function discoverAgentsMd(
  rootDir: string,
  options?: { parse?: boolean; maxDepth?: number }
): DiscoveredAgentsMd[] {
  const absoluteRoot = resolve(rootDir);
  const parse = options?.parse ?? false;
  const maxDepth = options?.maxDepth ?? 20;

  const results: DiscoveredAgentsMd[] = [];

  function walk(dir: string, depth: number) {
    if (depth > maxDepth) return;

    const agentsPath = join(dir, AGENTS_MD_FILENAME);
    if (existsSync(agentsPath)) {
      const relPath = relative(absoluteRoot, agentsPath);
      const depthFromRoot = relPath.split(/[/\\]/).length - 1;
      const item: DiscoveredAgentsMd = {
        path: relPath,
        absolutePath: resolve(agentsPath),
        depth: depthFromRoot,
      };
      if (parse) {
        try {
          const content = readFileSync(agentsPath, "utf-8");
          item.parsed = parseAgentsMd(content, agentsPath);
        } catch {
          // Skip parse errors
        }
      }
      results.push(item);
    }

    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
          walk(join(dir, entry.name), depth + 1);
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  walk(absoluteRoot, 0);

  return results.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.path.localeCompare(b.path);
  });
}

/**
 * Find the nearest AGENTS.md for a given file path.
 * Walks up the directory tree (like .gitignore resolution).
 */
export function findNearestAgentsMd(filePath: string): DiscoveredAgentsMd | null {
  let dir = resolve(filePath);
  try {
    if (!statSync(dir).isDirectory()) {
      dir = dirname(dir);
    }
  } catch {
    return null;
  }

  let current = dir;
  let depth = 0;

  while (current) {
    const agentsPath = join(current, AGENTS_MD_FILENAME);
    if (existsSync(agentsPath)) {
      const root = getRootPath(current);
      return {
        path: relative(root, agentsPath),
        absolutePath: resolve(agentsPath),
        depth,
      };
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
    depth++;
  }

  return null;
}

function getRootPath(dir: string): string {
  let d = dir;
  while (dirname(d) !== d) {
    d = dirname(d);
  }
  return d;
}
