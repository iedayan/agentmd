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

// Simple cache for parsed results to avoid re-parsing same files
const parseCache = new Map<string, import("./types.js").ParsedAgentsMd>();
const MAX_CACHE_SIZE = 100;

/**
 * Discover all AGENTS.md files under a directory.
 * Returns paths sorted by depth (root first), then alphabetically.
 */
export function discoverAgentsMd(
  rootDir: string,
  options?: { parse?: boolean; maxDepth?: number }
): DiscoveredAgentsMd[] {
  // Input validation
  if (typeof rootDir !== 'string') {
    throw new Error('Root directory must be a string');
  }
  
  if (options) {
    if (typeof options !== 'object' || options === null) {
      throw new Error('Options must be an object');
    }
    
    if (options.parse !== undefined && typeof options.parse !== 'boolean') {
      throw new Error('Options.parse must be a boolean');
    }
    
    if (options.maxDepth !== undefined) {
      if (typeof options.maxDepth !== 'number' || options.maxDepth < 0) {
        throw new Error('Options.maxDepth must be a non-negative number');
      }
    }
  }

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
          // Check cache first
          const cached = parseCache.get(agentsPath);
          if (cached) {
            item.parsed = cached;
          } else {
            const content = readFileSync(agentsPath, "utf-8");
            item.parsed = parseAgentsMd(content, agentsPath);
            
            // Cache management - simple LRU
            if (parseCache.size >= MAX_CACHE_SIZE) {
              const firstKey = parseCache.keys().next().value;
              if (firstKey) {
                parseCache.delete(firstKey);
              }
            }
            parseCache.set(agentsPath, item.parsed);
          }
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
