/**
 * Multi-File Composition Engine
 * Composes canonical AGENTS.md from fragments per agents-md pattern.
 * Supports agentmd.config.json for customization.
 * @see https://github.com/ivawzh/agents-md
 */

import { createRequire } from "module";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, relative, dirname, resolve } from "path";

const require = createRequire(import.meta.url);

const CONFIG_FILES = ["agentmd.config.json", "agentmd.config.js", "agentmd.config.cjs"];

/**
 * Load compose config from agentmd.config.json (or .js/.cjs) in rootDir.
 * Returns undefined if no config file exists.
 */
export function loadComposeConfig(rootDir: string): ComposeConfig | undefined {
  const root = resolve(rootDir);
  for (const name of CONFIG_FILES) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    try {
      if (name.endsWith(".json")) {
        const raw = readFileSync(path, "utf-8");
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return {
          include: Array.isArray(parsed.include) ? (parsed.include as string[]) : undefined,
          exclude: Array.isArray(parsed.exclude) ? (parsed.exclude as string[]) : undefined,
          defaultTarget:
            parsed.defaultTarget === "root" || parsed.defaultTarget === "nearest"
              ? (parsed.defaultTarget as "root" | "nearest")
              : undefined,
          annotateSources:
            typeof parsed.annotateSources === "boolean" ? parsed.annotateSources : undefined,
        };
      }
      if (name.endsWith(".js") || name.endsWith(".cjs")) {
        const mod = require(path);
        const cfg = mod.default ?? mod;
        if (cfg && typeof cfg === "object") {
          return {
            include: Array.isArray(cfg.include) ? cfg.include : undefined,
            exclude: Array.isArray(cfg.exclude) ? cfg.exclude : undefined,
            defaultTarget:
              cfg.defaultTarget === "root" || cfg.defaultTarget === "nearest"
                ? cfg.defaultTarget
                : undefined,
            annotateSources:
              typeof cfg.annotateSources === "boolean" ? cfg.annotateSources : undefined,
          };
        }
      }
    } catch {
      // Ignore parse errors, fall back to defaults
    }
  }
  return undefined;
}
import fg from "fast-glob";
import { parseAgentsMd } from "./parser.js";
import { parseDirectives, getDirectiveTarget, getDirectivePriority } from "./directives.js";

export interface ComposeConfig {
  /** Glob patterns for fragment discovery */
  include?: string[];
  /** Glob patterns to exclude */
  exclude?: string[];
  /** Annotate composed output with source comments */
  annotateSources?: boolean;
  /** Default target: "nearest" (per-dir) or "root" (single file) */
  defaultTarget?: "nearest" | "root";
}

const DEFAULT_INCLUDE = ["**/agents-md/**/*.md", "**/*.agents.md"];
const DEFAULT_EXCLUDE = ["**/node_modules/**", "**/.git/**"];

export interface Fragment {
  /** Path relative to root */
  path: string;
  /** Absolute path */
  absolutePath: string;
  /** Parsed content */
  content: string;
  /** Target directory from directive or default */
  targetDir: string;
  /** Priority for ordering (higher first) */
  priority: number;
  /** Directives from fragment */
  directives: ReturnType<typeof parseDirectives>;
}

export interface ComposeResult {
  /** Generated AGENTS.md files */
  generated: { path: string; content: string }[];
  /** Fragments that were composed */
  fragments: Fragment[];
  /** Warnings */
  warnings: string[];
}

/**
 * Discover fragment files using glob patterns.
 */
export function discoverFragments(
  rootDir: string,
  config: ComposeConfig = {}
): Fragment[] {
  const include = config.include ?? DEFAULT_INCLUDE;
  const exclude = config.exclude ?? DEFAULT_EXCLUDE;
  const defaultTarget = config.defaultTarget ?? "nearest";

  const patterns = include.map((p) => p.startsWith("/") ? p.slice(1) : p);
  const files = fg.sync(patterns, {
    cwd: rootDir,
    ignore: exclude,
    absolute: true,
    onlyFiles: true,
  });

  const fragments: Fragment[] = [];

  for (const absPath of files) {
    const content = readFileSync(absPath, "utf-8");
    const directives = parseDirectives(content);
    const targetFromDirective = getDirectiveTarget(directives);
    const priority = getDirectivePriority(directives);

    const relPath = relative(rootDir, absPath);
    const fragmentDir = dirname(absPath);

    let targetDir: string;
    if (targetFromDirective === "root") {
      targetDir = rootDir;
    } else if (targetFromDirective && targetFromDirective !== "nearest") {
      targetDir = resolve(rootDir, targetFromDirective);
    } else {
      targetDir = defaultTarget === "root" ? rootDir : fragmentDir;
    }

    fragments.push({
      path: relPath,
      absolutePath: absPath,
      content,
      targetDir,
      priority,
      directives,
    });
  }

  return fragments;
}

/**
 * Compose AGENTS.md files from fragments.
 * Loads agentmd.config.json (or .js/.cjs) from rootDir if present and no config provided.
 */
export function composeAgentsMd(rootDir: string, config: ComposeConfig = {}): ComposeResult {
  const loaded = Object.keys(config).length === 0 ? loadComposeConfig(rootDir) : undefined;
  const merged: ComposeConfig = loaded ? { ...loaded, ...config } : config;
  const fragments = discoverFragments(rootDir, merged);
  const annotate = merged.annotateSources ?? true;

  const warnings: string[] = [];
  const targetToFragments = new Map<string, Fragment[]>();

  for (const f of fragments) {
    const list = targetToFragments.get(f.targetDir) ?? [];
    list.push(f);
    targetToFragments.set(f.targetDir, list);
  }

  const generated: { path: string; content: string }[] = [];
  const rootResolved = resolve(rootDir);

  for (const [targetDir, frags] of targetToFragments) {
    const sorted = [...frags].sort((a, b) => b.priority - a.priority);

    const bodyParts: string[] = [];
    bodyParts.push("<!-- Generated by AgentMD compose. Do not edit directly. -->\n");

    for (const frag of sorted) {
      const body = extractBody(frag.content);
      if (annotate) {
        bodyParts.push(`<!-- source: ${frag.path} -->\n`);
      }
      bodyParts.push(body);
      if (annotate) {
        bodyParts.push(`\n<!-- /source: ${frag.path} -->\n`);
      }
      bodyParts.push("\n");
    }

    const content = bodyParts.join("").trimEnd();
    const relTarget = relative(rootResolved, targetDir);
    const outputPath = join(targetDir, "AGENTS.md");

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    writeFileSync(outputPath, content + "\n", "utf-8");
    generated.push({
      path: relTarget ? join(relTarget, "AGENTS.md") : "AGENTS.md",
      content,
    });
  }

  return { generated, fragments, warnings };
}

function extractBody(content: string): string {
  const fmMatch = content.match(/^---\s*\n[\s\S]*?\n---\s*\n?/);
  return fmMatch ? content.slice(fmMatch[0].length) : content;
}
