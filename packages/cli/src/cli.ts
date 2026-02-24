#!/usr/bin/env node
/**
 * AgentMD CLI
 * Commands: init, doctor, check, discover, parse, compose, run, score, export
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  parseAgentsMd,
  validateAgentsMd,
  validateOutputAgainstContract,
  discoverAgentsMd,
  composeAgentsMd,
  executeCommands,
  planCommandExecutions,
  computeAgentReadinessScore,
  exportToGitHubActions,
  parseFrontmatter,
  stringifyAgentsMd,
  type CommandType,
} from "@agentmd/core";

const args = process.argv.slice(2);
const command = args[0];

function parseInitArgs(initArgs: string[]): { target: string; template?: string } {
  let target = ".";
  let template: string | undefined;
  let i = 0;
  while (i < initArgs.length) {
    const a = initArgs[i];
    if (a === "--template" || a === "-t") {
      template = initArgs[i + 1];
      i += 2;
    } else if (!a.startsWith("-")) {
      target = a;
      i++;
    } else {
      i++;
    }
  }
  return { target, template };
}

const initParsed = command === "init" ? parseInitArgs(args.slice(1)) : null;
const target = initParsed?.target ?? (args[1] ?? ".");

/** Parse path + --json from command args (e.g. validate, parse, score) */
function parsePathAndJson(cmdArgs: string[]): { target: string; json: boolean } {
  let target = ".";
  let json = false;
  for (const a of cmdArgs) {
    if (a === "--json" || a === "-j") json = true;
    else if (!a.startsWith("-")) target = a;
  }
  return { target, json };
}

function parseCheckArgs(cmdArgs: string[]): {
  target: string;
  json: boolean;
  contract: boolean;
  output?: string;
} {
  let target = ".";
  let json = false;
  let contract = false;
  let output: string | undefined;
  let i = 0;

  while (i < cmdArgs.length) {
    const arg = cmdArgs[i];
    if (arg === "--json" || arg === "-j") {
      json = true;
      i++;
      continue;
    }
    if (arg === "--contract") {
      contract = true;
      i++;
      continue;
    }
    if (arg === "--output" || arg === "-o") {
      output = cmdArgs[i + 1];
      i += 2;
      continue;
    }
    if (!arg.startsWith("-")) {
      target = arg;
    }
    i++;
  }

  return { target, json, contract, output };
}

/** Parse improve args: path, --apply, --json */
function parseImproveArgs(cmdArgs: string[]): { target: string; apply: boolean; json: boolean } {
  let target = ".";
  let apply = false;
  let json = false;
  for (const a of cmdArgs) {
    if (a === "--apply" || a === "-a") apply = true;
    else if (a === "--json" || a === "-j") json = true;
    else if (!a.startsWith("-")) target = a;
  }
  return { target, apply, json };
}

/** Parse run args: path, types, --dry-run, --use-shell, --json */
function parseRunArgs(cmdArgs: string[]): { target: string; json: boolean; extra: string[] } {
  let target = ".";
  let json = false;
  const extra: string[] = [];
  let foundPath = false;
  for (const a of cmdArgs) {
    if (a === "--json" || a === "-j") json = true;
    else if (!a.startsWith("-") && !foundPath) {
      target = a;
      foundPath = true;
    } else {
      extra.push(a);
    }
  }
  return { target, json, extra };
}

function main() {
  switch (command) {
    case "init":
      cmdInit(target, initParsed?.template);
      break;
    case "validate":
      cmdCheck(parseCheckArgs(args.slice(1)));
      break;
    case "check":
      cmdCheck(parseCheckArgs(args.slice(1)));
      break;
    case "discover":
      cmdDiscover(target);
      break;
    case "parse":
      cmdParse(parsePathAndJson(args.slice(1)));
      break;
    case "compose":
      cmdCompose(target);
      break;
    case "run":
      cmdRun(parseRunArgs(args.slice(2)));
      break;
    case "doctor":
      cmdDoctor(target);
      break;
    case "score":
      cmdScore(parsePathAndJson(args.slice(1)));
      break;
    case "improve":
      cmdImprove(parseImproveArgs(args.slice(1)));
      break;
    case "export":
      cmdExport(target);
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error(`Run 'agentmd help' for usage.`);
      printHelp();
      process.exit(1);
  }
}

type ProjectType = "node" | "python" | "rust" | "go" | "generic";

const TEMPLATES: Record<ProjectType, string> = {
  node: `---
# Agent instructions for AI coding tools (Node.js)
---

## Install

\`\`\`bash
pnpm install
\`\`\`

## Build

\`\`\`bash
pnpm run build
\`\`\`

## Test

\`\`\`bash
pnpm run test
\`\`\`

## Lint

\`\`\`bash
pnpm run lint
\`\`\`
`,
  python: `---
# Agent instructions for AI coding tools (Python)
---

## Setup

\`\`\`bash
uv sync
\`\`\`

## Test

\`\`\`bash
uv run pytest
\`\`\`

## Lint

\`\`\`bash
uv run ruff check .
\`\`\`

## Format

\`\`\`bash
uv run ruff format .
\`\`\`
`,
  rust: `---
# Agent instructions for AI coding tools (Rust)
---

## Build

\`\`\`bash
cargo build
\`\`\`

## Test

\`\`\`bash
cargo test
\`\`\`

## Lint

\`\`\`bash
cargo clippy
\`\`\`

## Format

\`\`\`bash
cargo fmt
\`\`\`
`,
  go: `---
# Agent instructions for AI coding tools (Go)
---

## Build

\`\`\`bash
go build ./...
\`\`\`

## Test

\`\`\`bash
go test ./...
\`\`\`

## Lint

\`\`\`bash
golangci-lint run
\`\`\`
`,
  generic: `---
# Agent instructions for AI coding tools
---

## Build

\`\`\`bash
pnpm run build
\`\`\`

## Test

\`\`\`bash
pnpm run test
\`\`\`

## Lint

\`\`\`bash
pnpm run lint
\`\`\`
`,
};

function detectProjectType(dir: string): ProjectType {
  if (existsSync(resolve(dir, "Cargo.toml"))) return "rust";
  if (existsSync(resolve(dir, "go.mod"))) return "go";
  if (existsSync(resolve(dir, "pyproject.toml")) || existsSync(resolve(dir, "requirements.txt"))) return "python";
  if (existsSync(resolve(dir, "package.json"))) return "node";
  return "generic";
}

function buildNodeTemplate(dir: string): string {
  try {
    const pkgPath = resolve(dir, "package.json");
    if (!existsSync(pkgPath)) return TEMPLATES.node;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { scripts?: Record<string, string> };
    const scripts = pkg?.scripts ?? {};
    const pm = existsSync(resolve(dir, "pnpm-lock.yaml")) ? "pnpm" : existsSync(resolve(dir, "yarn.lock")) ? "yarn" : "npm";
    const run = pm === "pnpm" || pm === "yarn" ? "run" : "run";

    const sections: string[] = [];
    sections.push(`## Install\n\n\`\`\`bash\n${pm} install\n\`\`\`\n`);
    if (scripts.build) {
      sections.push(`## Build\n\n\`\`\`bash\n${pm} ${run} build\n\`\`\`\n`);
    }
    if (scripts.test) {
      sections.push(`## Test\n\n\`\`\`bash\n${pm} ${run} test\n\`\`\`\n`);
    }
    if (scripts.lint) {
      sections.push(`## Lint\n\n\`\`\`bash\n${pm} ${run} lint\n\`\`\`\n`);
    }
    if (scripts.format) {
      sections.push(`## Format\n\n\`\`\`bash\n${pm} ${run} format\n\`\`\`\n`);
    }
    if (sections.length === 0) return TEMPLATES.node;
    return `---
# Agent instructions for AI coding tools (Node.js)
# Generated from package.json scripts
---

${sections.join("")}`.trim() + "\n";
  } catch {
    return TEMPLATES.node;
  }
}

function cmdInit(target: string, templateOverride?: string) {
  const path = resolve(target);
  const filePath = path.endsWith("AGENTS.md") ? path : resolve(path, "AGENTS.md");

  if (existsSync(filePath)) {
    console.log(`AGENTS.md already exists at ${filePath}`);
    console.log("Run 'agentmd check --contract' to validate it.");
    return;
  }

  try {
    const dir = path.endsWith("AGENTS.md") ? resolve(path, "..") : path;
    if (!existsSync(dir)) {
      console.error(`Directory not found: ${dir}`);
      process.exit(1);
    }

    let content: string;
    const explicitTemplate = templateOverride?.toLowerCase() as ProjectType | undefined;
    if (explicitTemplate && TEMPLATES[explicitTemplate]) {
      content = TEMPLATES[explicitTemplate];
      console.log(`Using template: ${explicitTemplate}`);
    } else if (explicitTemplate) {
      console.error(`Unknown template: ${templateOverride}. Use: node, python, rust, go, generic`);
      process.exit(1);
    } else {
      const detected = detectProjectType(dir);
      if (detected === "node") {
        content = buildNodeTemplate(dir);
        console.log(`Detected Node.js project — using package.json scripts`);
      } else {
        content = TEMPLATES[detected];
        console.log(`Detected ${detected} project — using ${detected} template`);
      }
    }

    writeFileSync(filePath, content.trim() + "\n", "utf-8");
    console.log(`Created AGENTS.md at ${filePath}`);
    console.log("\nNext steps:");
    console.log("  1. Edit AGENTS.md if needed");
    console.log("  2. Run 'agentmd check --contract' to validate it");
    console.log("  3. Run 'agentmd score' for your agent-readiness score");
    console.log("  4. Run 'agentmd run . --dry-run' to preview execution");
  } catch (err) {
    console.error(`Failed to create AGENTS.md: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

function cmdCheck(opts: { target: string; json: boolean; contract: boolean; output?: string }) {
  const path = resolve(opts.target);
  const filePath = path.endsWith("AGENTS.md") ? path : resolve(path, "AGENTS.md");

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
      console.error("Run 'agentmd init' to create a sample AGENTS.md");
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const parsed = parseAgentsMd(content, filePath);
  const result = validateAgentsMd(parsed, { requireOutputContract: opts.contract });
  const outputPath = opts.output ? resolve(opts.output) : undefined;
  const hasOutputPath = typeof outputPath === "string";
  const outputValidation =
    outputPath && existsSync(outputPath)
      ? validateOutputAgainstContract(parsed, readFileSync(outputPath, "utf-8"))
      : undefined;
  const combinedErrors = [...result.errors, ...(outputValidation?.errors ?? [])];
  const combinedWarnings = [...result.warnings, ...(outputValidation?.warnings ?? [])];
  const valid = combinedErrors.length === 0;

  if (opts.json) {
    console.log(JSON.stringify({
      ok: valid,
      valid,
      errors: combinedErrors,
      warnings: combinedWarnings,
      suggestions: result.suggestions,
    }));
    process.exit(valid ? 0 : 1);
  }

  if (combinedErrors.length > 0) {
    console.error("Validation failed:\n");
    for (const e of combinedErrors) {
      console.error(`  ✗ ${e.message}${e.line ? ` (line ${e.line})` : ""}`);
    }
    process.exit(1);
  }

  if (combinedWarnings.length > 0) {
    console.log("Warnings:\n");
    for (const w of combinedWarnings) {
      console.log(`  ⚠ ${w.message}${w.line ? ` (line ${w.line})` : ""}`);
    }
  }

  if (result.suggestions.length > 0) {
    console.log("\nSuggestions:");
    for (const s of result.suggestions) {
      console.log(`  • ${s}`);
    }
  }

  if (hasOutputPath && outputPath && !existsSync(outputPath)) {
    console.log(`\nWarning: output file not found: ${outputPath}`);
  } else if (outputValidation && outputPath) {
    console.log(`\n✓ Output at ${outputPath} matches output_contract.`);
  }

  if (result.valid && combinedWarnings.length === 0 && result.suggestions.length === 0) {
    console.log("✓ AGENTS.md is valid.");
  } else if (result.valid) {
    console.log("\n✓ AGENTS.md passed validation (with notes above).");
  }
}

function cmdDiscover(target: string) {
  const root = resolve(target);
  const results = discoverAgentsMd(root, { parse: true });

  if (results.length === 0) {
    console.log(`No AGENTS.md files found under ${root}`);
    return;
  }

  console.log(`Found ${results.length} AGENTS.md file(s):\n`);
  for (const r of results) {
    const depth = r.depth === 0 ? "root" : `depth ${r.depth}`;
    const cmdCount = r.parsed?.commands.length ?? 0;
    console.log(`  ${r.path} (${depth})${cmdCount > 0 ? ` — ${cmdCount} commands` : ""}`);
  }
}

function cmdParse(opts: { target: string; json: boolean }) {
  const path = resolve(opts.target);
  const filePath = path.endsWith("AGENTS.md") ? path : resolve(path, "AGENTS.md");

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
      console.error("Run 'agentmd init' to create a sample AGENTS.md");
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const parsed = parseAgentsMd(content, filePath);

  if (opts.json) {
    console.log(JSON.stringify({
      ok: true,
      lineCount: parsed.lineCount,
      sections: parsed.sections.map((s) => ({
        title: s.title,
        level: s.level,
        lineStart: s.lineStart,
        lineEnd: s.lineEnd,
        children: s.children,
      })),
      commands: parsed.commands.map((c) => ({
        command: c.command,
        type: c.type,
        section: c.section,
        line: c.line,
      })),
    }));
    return;
  }

  console.log(`AGENTS.md: ${parsed.lineCount} lines, ${parsed.sections.length} sections, ${parsed.commands.length} commands`);
  if (parsed.commands.length === 0) {
    console.log("  → Add commands in backticks or code blocks. Run 'agentmd help' for examples.");
  }
  console.log("");

  console.log("Sections:");
  const printSection = (s: { title: string; level: number; children: unknown[] }, indent = "") => {
    console.log(`${indent}${"#".repeat(s.level)} ${s.title}`);
    for (const c of s.children as { title: string; level: number; children: unknown[] }[]) {
      printSection(c, indent + "  ");
    }
  };
  for (const s of parsed.sections) {
    printSection(s);
  }

  if (parsed.commands.length > 0) {
    console.log("\nExtracted commands:");
    for (const c of parsed.commands) {
      console.log(`  [${c.type}] ${c.command} (${c.section}, line ${c.line})`);
    }
  }
}

function cmdCompose(target: string) {
  const root = resolve(target);
  const result = composeAgentsMd(root);

  if (result.generated.length === 0) {
    console.log("No fragments found. Add files matching **/agents-md/**/*.md or **/*.agents.md");
    return;
  }

  console.log(`Composed ${result.generated.length} AGENTS.md file(s):\n`);
  for (const g of result.generated) {
    console.log(`  ${g.path} (${g.content.split("\n").length} lines)`);
  }
}

async function cmdRun(opts: { target: string; json: boolean; extra: string[] }) {
  // Validate types early so we fail with "Unknown command type" before file checks
  const typeArgs = opts.extra.filter((a) => a !== "--dry-run" && a !== "--use-shell");
  const types = parseRequestedTypes(typeArgs);

  const path = resolve(opts.target);
  const filePath = path.endsWith("AGENTS.md") ? path : resolve(path, "AGENTS.md");

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const parsed = parseAgentsMd(content, filePath);
  const dryRun = opts.extra.includes("--dry-run");
  const useShell = opts.extra.includes("--use-shell");

  if (parsed.commands.length === 0) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: "No executable commands found in AGENTS.md" }));
    } else {
      console.log("No executable commands found in AGENTS.md");
      console.log("Add commands in backticks (e.g. `pnpm test`) or code blocks.");
    }
    process.exit(1);
  }
  const toRun = types
    ? parsed.commands.filter((c) => types.includes(c.type))
    : parsed.commands;

  const plan = planCommandExecutions(toRun, {
    useShell,
    permissions: parsed.frontmatter?.permissions as NonNullable<
      Parameters<typeof executeCommands>[1]
    >["permissions"],
  });
  if (plan.blockedCount > 0) {
    console.log(
      `Preflight: ${plan.runnableCount}/${plan.items.length} command(s) runnable, ${plan.blockedCount} blocked.`
    );
    for (const item of plan.items.filter((entry) => !entry.runnable)) {
      console.log(`  ✗ ${item.command}`);
      for (const reason of item.reasons) {
        console.log(`      - ${reason}`);
      }
    }
    console.log("");
  }
  const runnableCommands = plan.items
    .filter((item) => item.runnable)
    .map((item) => toRun.find((cmd) => cmd.command === item.command && cmd.line === item.line))
    .filter((cmd): cmd is NonNullable<typeof cmd> => Boolean(cmd));

  if (runnableCommands.length === 0) {
    if (opts.json) {
      console.log(JSON.stringify({
        ok: false,
        error: "No runnable commands after preflight",
        blocked: plan.items.filter((i) => !i.runnable).map((i) => ({ command: i.command, reasons: i.reasons })),
      }));
    } else {
      console.log("No runnable commands after preflight.");
      if (!useShell && plan.items.some((item) => item.requiresShell)) {
        console.log("Hint: rerun with --use-shell for commands that require shell operators.");
      }
    }
    process.exit(1);
  }

  if (!opts.json) {
    if (dryRun) console.log(`[Dry run] Would execute ${runnableCommands.length} command(s)...\n`);
    else console.log(`Running ${runnableCommands.length} command(s)...\n`);
  }
  const results = await executeCommands(runnableCommands, {
    dryRun,
    useShell: useShell || false,
    cwd: path.endsWith("AGENTS.md") ? resolve(path, "..") : path,
    permissions: parsed.frontmatter?.permissions as NonNullable<
      Parameters<typeof executeCommands>[1]
    >["permissions"],
  });

  let failed = 0;
  for (const r of results) {
    if (!r.success) failed++;
  }

  if (opts.json) {
    const output = {
      ok: failed === 0 && plan.blockedCount === 0,
      dryRun,
      results: results.map((r) => ({
        command: r.command,
        type: r.type,
        success: r.success,
        exitCode: r.exitCode,
        durationMs: r.durationMs,
        error: r.error,
      })),
      blockedCount: plan.blockedCount,
    };
    console.log(JSON.stringify(output));
  } else {
    for (const r of results) {
      const icon = r.success ? "✓" : "✗";
      const status = r.success ? "" : ` (${r.error ?? r.exitCode})`;
      console.log(`  ${icon} [${r.type}] ${r.command}${status}`);
      if (!r.success && r.stderr) {
        console.log(`      ${r.stderr.slice(0, 100)}${r.stderr.length > 100 ? "..." : ""}`);
      }
    }

    if (!useShell) {
      const hasShellBlocked = results.some((r) =>
        (r.error ?? "").includes("requires shell features")
      );
      if (hasShellBlocked) {
        console.log("\nHint: rerun with --use-shell for commands that require shell operators.");
      }
    }

    if (plan.blockedCount > 0) {
      console.error(
        `Execution incomplete: ${plan.blockedCount} command(s) were blocked during preflight.`
      );
      failed += plan.blockedCount;
    }
  }

  if (failed > 0) process.exit(1);
}

function cmdDoctor(target: string) {
  const path = resolve(target);
  const filePath = path.endsWith("AGENTS.md") ? path : resolve(path, "AGENTS.md");

  if (!existsSync(filePath)) {
    console.error(`AGENTS.md not found at ${filePath}`);
    console.log("Run: agentmd init");
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const parsed = parseAgentsMd(content, filePath);
  const validation = validateAgentsMd(parsed);
  const score = computeAgentReadinessScore(parsed);
  const plan = planCommandExecutions(parsed.commands, {
    permissions: parsed.frontmatter?.permissions as NonNullable<
      Parameters<typeof executeCommands>[1]
    >["permissions"],
    useShell: false,
  });

  console.log(`Doctor report for ${filePath}`);
  console.log(
    `Summary: ${parsed.sections.length} sections, ${parsed.commands.length} commands, score ${score}/100`
  );
  console.log(
    `Execution preflight: ${plan.runnableCount} runnable, ${plan.blockedCount} blocked (safe mode)`
  );

  if (validation.errors.length > 0) {
    console.log("\nErrors:");
    for (const error of validation.errors.slice(0, 10)) {
      console.log(`  ✗ ${error.message}${error.line ? ` (line ${error.line})` : ""}`);
    }
  }
  if (validation.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of validation.warnings.slice(0, 10)) {
      console.log(`  ⚠ ${warning.message}${warning.line ? ` (line ${warning.line})` : ""}`);
    }
  }
  if (validation.suggestions.length > 0) {
    console.log("\nSuggested improvements:");
    for (const suggestion of validation.suggestions.slice(0, 8)) {
      console.log(`  • ${suggestion}`);
    }
  }
  const blocked = plan.items.filter((item) => !item.runnable);
  if (blocked.length > 0) {
    console.log("\nBlocked commands:");
    for (const item of blocked.slice(0, 10)) {
      console.log(`  ✗ ${item.command}`);
      for (const reason of item.reasons.slice(0, 2)) {
        console.log(`      - ${reason}`);
      }
    }
  }

  console.log("\nNext steps:");
  console.log("  1. Run `agentmd check --contract` to review full validation output.");
  console.log("  2. Run `agentmd run . --dry-run` to preview execution.");
  if (blocked.some((item) => item.requiresShell)) {
    console.log("  3. If needed, rerun with `agentmd run . --use-shell` for shell operators.");
  } else {
    console.log("  3. Run `agentmd run .` once preflight is clean.");
  }
}

function cmdImprove(opts: { target: string; apply: boolean; json: boolean }) {
  const path = resolve(opts.target);
  const filePath = path.endsWith("AGENTS.md") ? path : resolve(path, "AGENTS.md");
  const dir = path.endsWith("AGENTS.md") ? resolve(path, "..") : path;

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
      console.error("Run 'agentmd init' to create a sample AGENTS.md");
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const parsed = parseAgentsMd(content, filePath);
  const validation = validateAgentsMd(parsed);
  const scoreBefore = computeAgentReadinessScore(parsed);

  const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);
  const sectionTitles = parsed.sections.map((s) => s.title.toLowerCase());
  const hasInstallSection = sectionTitles.some(
    (t) => t.includes("install") || t.includes("setup")
  );

  const improvements: string[] = [];
  let newBody = body;
  const newFrontmatter = hasFrontmatter && Object.keys(frontmatter).length > 0
    ? { ...frontmatter } as Record<string, unknown>
    : {} as Record<string, unknown>;

  if (!hasInstallSection && parsed.sections.length > 0) {
    const pm = existsSync(resolve(dir, "pnpm-lock.yaml"))
      ? "pnpm"
      : existsSync(resolve(dir, "yarn.lock"))
        ? "yarn"
        : "npm";
    const installBlock = `## Install\n\n\`${pm} install\`\n\n`;
    const firstHeading = newBody.search(/^##\s/m);
    if (firstHeading >= 0) {
      newBody = newBody.slice(0, firstHeading) + installBlock + newBody.slice(firstHeading);
    } else {
      newBody = installBlock + newBody;
    }
    improvements.push("Added Install section");
  }

  let pkgName: string | undefined;
  try {
    const pkgPath = resolve(dir, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { name?: string };
      pkgName = typeof pkg?.name === "string" ? pkg.name : undefined;
    }
  } catch {
    /* ignore */
  }

  const needsName = !frontmatter?.name || String(frontmatter.name).trim() === "";
  if (needsName && pkgName) {
    newFrontmatter.name = pkgName;
    improvements.push(`Added frontmatter name: ${pkgName}`);
  }

  const needsPurpose =
    !frontmatter?.purpose || String(frontmatter.purpose).trim() === "";
  if (needsPurpose && (Object.keys(newFrontmatter).length > 0 || improvements.length > 0)) {
    newFrontmatter.purpose = "Agent instructions for this project";
    improvements.push("Added frontmatter purpose");
  }

  const newContent =
    Object.keys(newFrontmatter).length > 0
      ? stringifyAgentsMd(newBody, newFrontmatter)
      : newBody;

  const scoreAfter =
    improvements.length > 0
      ? computeAgentReadinessScore(parseAgentsMd(newContent, filePath))
      : scoreBefore;

  if (opts.json) {
    console.log(
      JSON.stringify({
        ok: true,
        scoreBefore,
        scoreAfter,
        improvements,
        applied: opts.apply && improvements.length > 0,
      })
    );
    if (opts.apply && improvements.length > 0) {
      writeFileSync(filePath, newContent, "utf-8");
    }
    return;
  }

  if (improvements.length === 0) {
    console.log(`AGENTS.md score: ${scoreBefore}/100 — no improvements suggested.`);
    return;
  }

  console.log(`Suggested improvements (score: ${scoreBefore} → ${scoreAfter}):`);
  for (const imp of improvements) {
    console.log(`  • ${imp}`);
  }

  if (opts.apply) {
    writeFileSync(filePath, newContent, "utf-8");
    console.log(`\n✓ Applied ${improvements.length} improvement(s) to ${filePath}`);
  } else {
    console.log(`\nRun 'agentmd improve --apply' to apply these changes.`);
  }
}

const ALLOWED_COMMAND_TYPES: CommandType[] = [
  "build",
  "test",
  "lint",
  "format",
  "install",
  "setup",
  "deploy",
  "security",
  "other",
];

function parseRequestedTypes(typeArgs: string[]): CommandType[] | undefined {
  if (typeArgs.length === 0) return undefined;

  const invalid = typeArgs.filter((arg) => !ALLOWED_COMMAND_TYPES.includes(arg as CommandType));
  if (invalid.length > 0) {
    console.error(`Unknown command type(s): ${invalid.join(", ")}`);
    console.error(`Allowed types: ${ALLOWED_COMMAND_TYPES.join(", ")}`);
    process.exit(1);
  }

  return typeArgs as CommandType[];
}

function cmdScore(opts: { target: string; json: boolean }) {
  const path = resolve(opts.target);
  const filePath = path.endsWith("AGENTS.md") ? path : resolve(path, "AGENTS.md");

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
      console.error("Run 'agentmd init' to create a sample AGENTS.md");
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const parsed = parseAgentsMd(content, filePath);
  const score = computeAgentReadinessScore(parsed);

  if (opts.json) {
    console.log(JSON.stringify({ ok: true, score }));
    return;
  }

  console.log(`Agent-readiness score: ${score}/100`);
  if (score < 50) console.log("  → Add sections, commands, and frontmatter to improve.");
  else if (score < 80) console.log("  → Consider adding frontmatter and guardrails.");
  else console.log("  → AGENTS.md is well-structured for agent use.");
}

function cmdExport(target: string) {
  const path = resolve(target);
  const filePath = path.endsWith("AGENTS.md") ? path : resolve(path, "AGENTS.md");

  if (!existsSync(filePath)) {
    console.error(`AGENTS.md not found at ${filePath}`);
    console.error("Run 'agentmd init' to create a sample AGENTS.md");
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const parsed = parseAgentsMd(content, filePath);
  const yaml = exportToGitHubActions(parsed);
  console.log(yaml);
}

function printHelp() {
  console.log(`
AgentMD — CI/CD for AI Agents. Makes AGENTS.md executable.

Usage: agentmd <command> [path] [options]

Commands:
  init [path]       Create AGENTS.md (auto-detects project type, use --template to override)
  doctor [path]     Diagnose AGENTS.md quality and runnable commands
  check [path]      Validate AGENTS.md (flags: --contract, --output <file>, --json)
  validate [path]   Alias for check
  improve [path]    Self-improve AGENTS.md from validation feedback (use --apply to write)
  discover [path]  Find all AGENTS.md in repo
  parse [path]      Parse and show structure
  compose [path]    Build AGENTS.md from fragments
  run [path] [types]  Execute commands (flags: --dry-run, --use-shell, --json)
  score [path]      Agent-readiness score (0-100)
  export [path]     Generate GitHub Actions workflow YAML
  help              Show this help

Quick start:
  agentmd init                    # Auto-detect project type
  agentmd init --template python  # Force Python template
  agentmd doctor        # Diagnose and get next steps
  agentmd check --contract   # Check contract coverage
  agentmd score         # Get your score
  agentmd run . --dry-run   # Preview execution

See https://agents.md for the AGENTS.md standard.
`);
}

main();
