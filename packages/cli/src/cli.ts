#!/usr/bin/env node
/**
 * AgentMD CLI
 * Commands: init, doctor, check, discover, parse, compose, run, score, export, login, logout
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync, unlinkSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';
import { } from 'crypto';
import * as https from 'https';
import * as http from 'http';
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
} from '@agentmd-dev/core';

const args = process.argv.slice(2);
const command = args[0];

function parseInitArgs(initArgs: string[]): { target: string; template?: string } {
  let target = '.';
  let template: string | undefined;
  let i = 0;
  while (i < initArgs.length) {
    const a = initArgs[i];
    if (a === '--template' || a === '-t') {
      template = initArgs[i + 1];
      i += 2;
    } else if (!a.startsWith('-')) {
      target = a;
      i++;
    } else {
      i++;
    }
  }
  return { target, template };
}

const initParsed = command === 'init' ? parseInitArgs(args.slice(1)) : null;
const target = initParsed?.target ?? args[1] ?? '.';

/** Parse path + --json from command args (e.g. validate, parse, score) */
function parsePathAndJson(cmdArgs: string[]): { target: string; json: boolean } {
  let target = '.';
  let json = false;
  for (const a of cmdArgs) {
    if (a === '--json' || a === '-j') json = true;
    else if (!a.startsWith('-')) target = a;
  }
  return { target, json };
}

function parseCheckArgs(cmdArgs: string[]): {
  target: string;
  json: boolean;
  contract: boolean;
  output?: string;
} {
  let target = '.';
  let json = false;
  let contract = false;
  let output: string | undefined;
  let i = 0;

  while (i < cmdArgs.length) {
    const arg = cmdArgs[i];
    if (arg === '--json' || arg === '-j') {
      json = true;
      i++;
      continue;
    }
    if (arg === '--contract') {
      contract = true;
      i++;
      continue;
    }
    if (arg === '--output' || arg === '-o') {
      output = cmdArgs[i + 1];
      i += 2;
      continue;
    }
    if (!arg.startsWith('-')) {
      target = arg;
    }
    i++;
  }

  return { target, json, contract, output };
}

/** Parse improve args: path, --apply, --json */
function parseImproveArgs(cmdArgs: string[]): { target: string; apply: boolean; json: boolean } {
  let target = '.';
  let apply = false;
  let json = false;
  for (const a of cmdArgs) {
    if (a === '--apply' || a === '-a') apply = true;
    else if (a === '--json' || a === '-j') json = true;
    else if (!a.startsWith('-')) target = a;
  }
  return { target, apply, json };
}

/** Parse run args: path, types, --dry-run, --use-shell, --include-output, --json */
function parseRunArgs(cmdArgs: string[]): { target: string; json: boolean; extra: string[] } {
  let target = '.';
  let json = false;
  const extra: string[] = [];
  let foundPath = false;
  for (const a of cmdArgs) {
    if (a === '--json' || a === '-j') json = true;
    else if (!a.startsWith('-') && !foundPath) {
      target = a;
      foundPath = true;
    } else {
      extra.push(a);
    }
  }
  return { target, json, extra };
}

// ─── Credentials helpers ────────────────────────────────────────────────────

const CREDENTIALS_FILE = join(homedir(), '.config', 'agentmd', 'credentials.json');
const DASHBOARD_URL = process.env.AGENTMD_DASHBOARD_URL ?? 'https://agentmd.online';

interface Credentials {
  token: string;
  dashboardUrl: string;
  createdAt: string;
}

function readCredentials(): Credentials | null {
  try {
    if (!existsSync(CREDENTIALS_FILE)) return null;
    return JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8')) as Credentials;
  } catch {
    return null;
  }
}

function writeCredentials(creds: Credentials): void {
  const dir = join(homedir(), '.config', 'agentmd');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), 'utf-8');
  try { chmodSync(CREDENTIALS_FILE, 0o600); } catch { /* ignore on Windows */ }
}

function deleteCredentials(): boolean {
  if (!existsSync(CREDENTIALS_FILE)) return false;
  unlinkSync(CREDENTIALS_FILE);
  return true;
}

/** Minimal fetch over Node's built-in http/https — no extra deps. */
function nodeFetch(
  url: string,
  options: { method?: string; body?: string; headers?: Record<string, string>; timeoutMs?: number },
): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        res.on('end', () => {
          resolve({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, status: res.statusCode ?? 0, body });
        });
      },
    );
    req.on('error', reject);
    if (options.timeoutMs) req.setTimeout(options.timeoutMs, () => { req.destroy(new Error('Request timeout')); });
    if (options.body) req.write(options.body);
    req.end();
  });
}


// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  switch (command) {
    case 'init':
      cmdInit(target, initParsed?.template);
      break;
    case 'validate':
      await cmdCheck(parseCheckArgs(args.slice(1)));
      break;
    case 'check':
      await cmdCheck(parseCheckArgs(args.slice(1)));
      break;
    case 'discover':
      cmdDiscover(target);
      break;
    case 'parse':
      cmdParse(parsePathAndJson(args.slice(1)));
      break;
    case 'compose':
      cmdCompose(target);
      break;
    case 'run':
      await cmdRun(parseRunArgs(args.slice(2)));
      break;
    case 'doctor':
      await cmdDoctor(target);
      break;
    case 'score':
      await cmdScore(parsePathAndJson(args.slice(1)));
      break;
    case 'improve':
      await cmdImprove(parseImproveArgs(args.slice(1)));
      break;
    case 'export':
      await cmdExport(target);
      break;
    case 'login':
      await cmdLogin();
      break;
    case 'logout':
      cmdLogout();
      break;
    case 'whoami':
      cmdWhoami();
      break;
    case 'help':
    case '--help':
    case '-h':
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

type ProjectType =
  | 'node'
  | 'python'
  | 'rust'
  | 'go'
  | 'nextjs'
  | 'django'
  | 'rails'
  | 'monorepo'
  | 'generic';

const TEMPLATES: Record<ProjectType, string> = {
  nextjs: `---
agent:
  name: nextjs-agent
  purpose: "Work on Next.js projects"
  guardrails:
    - "Run tests before committing"
---

# Next.js Project

## Setup
\`\`\`bash
pnpm install
\`\`\`

## Build
\`\`\`bash
pnpm run build
\`\`\`

## Test
\`\`\`bash
pnpm test
\`\`\`

## Lint
\`\`\`bash
pnpm run lint
\`\`\`
`,
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
  django: `---
agent:
  name: django-agent
  purpose: "Work on Django projects"
  guardrails:
    - "Run tests before committing"
    - "Never run migrate without explicit approval"
---

# Django Project

## Setup
\`\`\`bash
uv sync
\`\`\`

## Test
\`\`\`bash
python manage.py test
\`\`\`

## Lint
\`\`\`bash
ruff check .
ruff format .
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
  rails: `---
agent:
  name: rails-agent
  purpose: "Work on Ruby on Rails projects"
  guardrails:
    - "Run tests before committing"
---

# Rails Project

## Setup
\`\`\`bash
bundle install
\`\`\`

## Test
\`\`\`bash
bundle exec rspec
\`\`\`

## Lint
\`\`\`bash
bundle exec rubocop
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
  monorepo: `---
agent:
  name: monorepo-agent
  purpose: "Work on pnpm monorepo projects"
  guardrails:
    - "Run tests from repo root"
---

# Monorepo

## Setup
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
  if (existsSync(resolve(dir, 'Cargo.toml'))) return 'rust';
  if (existsSync(resolve(dir, 'go.mod'))) return 'go';
  if (existsSync(resolve(dir, 'Gemfile')) && existsSync(resolve(dir, 'config', 'application.rb')))
    return 'rails';
  if (existsSync(resolve(dir, 'manage.py'))) return 'django';
  if (existsSync(resolve(dir, 'pyproject.toml')) || existsSync(resolve(dir, 'requirements.txt')))
    return 'python';
  if (existsSync(resolve(dir, 'pnpm-workspace.yaml')) || existsSync(resolve(dir, 'lerna.json')))
    return 'monorepo';
  if (existsSync(resolve(dir, 'package.json'))) {
    try {
      const pkg = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf-8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      if (pkg?.dependencies?.next || pkg?.devDependencies?.next) return 'nextjs';
    } catch {
      /* ignore */
    }
    return 'node';
  }
  return 'generic';
}

function buildNodeTemplate(dir: string): string {
  try {
    const pkgPath = resolve(dir, 'package.json');
    if (!existsSync(pkgPath)) return TEMPLATES.node;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { scripts?: Record<string, string> };
    const scripts = pkg?.scripts ?? {};
    const pm = existsSync(resolve(dir, 'pnpm-lock.yaml'))
      ? 'pnpm'
      : existsSync(resolve(dir, 'yarn.lock'))
        ? 'yarn'
        : 'npm';
    const run = pm === 'pnpm' || pm === 'yarn' ? 'run' : 'run';

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
    return (
      `---
# Agent instructions for AI coding tools (Node.js)
# Generated from package.json scripts
---

${sections.join('')}`.trim() + '\n'
    );
  } catch {
    return TEMPLATES.node;
  }
}

function cmdInit(target: string, templateOverride?: string) {
  const path = resolve(target);
  const filePath = path.endsWith('AGENTS.md') ? path : resolve(path, 'AGENTS.md');

  if (existsSync(filePath)) {
    console.log(`AGENTS.md already exists at ${filePath}`);
    console.log("Run 'agentmd check --contract' to validate it.");
    return;
  }

  try {
    const dir = path.endsWith('AGENTS.md') ? resolve(path, '..') : path;
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
      console.error(
        `Unknown template: ${templateOverride}. Use: node, python, rust, go, nextjs, django, rails, monorepo, generic`,
      );
      process.exit(1);
    } else {
      const detected = detectProjectType(dir);
      if (detected === 'node') {
        content = buildNodeTemplate(dir);
        console.log(`Detected Node.js project — using package.json scripts`);
      } else {
        content = TEMPLATES[detected];
        console.log(`Detected ${detected} project — using ${detected} template`);
      }
    }

    writeFileSync(filePath, content.trim() + '\n', 'utf-8');
    console.log(`Created AGENTS.md at ${filePath}`);
    console.log('\nNext steps:');
    console.log('  1. Edit AGENTS.md if needed');
    console.log("  2. Run 'agentmd check --contract' to validate it");
    console.log("  3. Run 'agentmd score' for your agent-readiness score");
    console.log("  4. Run 'agentmd run . --dry-run' to preview execution");
  } catch (err) {
    console.error(`Failed to create AGENTS.md: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

async function cmdCheck(opts: {
  target: string;
  json: boolean;
  contract: boolean;
  output?: string;
}) {
  const path = resolve(opts.target);
  const filePath = path.endsWith('AGENTS.md') ? path : resolve(path, 'AGENTS.md');

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
      console.error("Run 'agentmd init' to create a sample AGENTS.md");
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseAgentsMd(content, filePath);
  const result = await validateAgentsMd(parsed, { requireOutputContract: opts.contract });
  const outputPath = opts.output ? resolve(opts.output) : undefined;
  const hasOutputPath = typeof outputPath === 'string';
  const outputValidation =
    outputPath && existsSync(outputPath)
      ? validateOutputAgainstContract(parsed, readFileSync(outputPath, 'utf-8'))
      : undefined;
  const combinedErrors = [...result.errors, ...(outputValidation?.errors ?? [])];
  const combinedWarnings = [...result.warnings, ...(outputValidation?.warnings ?? [])];
  const valid = combinedErrors.length === 0;

  if (opts.json) {
    console.log(
      JSON.stringify({
        ok: valid,
        valid,
        errors: combinedErrors,
        warnings: combinedWarnings,
        suggestions: result.suggestions,
      }),
    );
    process.exit(valid ? 0 : 1);
  }

  if (combinedErrors.length > 0) {
    console.error('Validation failed:\n');
    for (const e of combinedErrors) {
      console.error(`  ✗ ${e.message}${e.line ? ` (line ${e.line})` : ''}`);
    }
    process.exit(1);
  }

  if (combinedWarnings.length > 0) {
    console.log('Warnings:\n');
    for (const w of combinedWarnings) {
      console.log(`  ⚠ ${w.message}${w.line ? ` (line ${w.line})` : ''}`);
    }
  }

  if (result.suggestions.length > 0) {
    console.log('\nSuggestions:');
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
    console.log('✓ AGENTS.md is valid.');
  } else if (result.valid) {
    console.log('\n✓ AGENTS.md passed validation (with notes above).');
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
    const depth = r.depth === 0 ? 'root' : `depth ${r.depth}`;
    const cmdCount = r.parsed?.commands.length ?? 0;
    console.log(`  ${r.path} (${depth})${cmdCount > 0 ? ` — ${cmdCount} commands` : ''}`);
  }
}

function cmdParse(opts: { target: string; json: boolean }) {
  const path = resolve(opts.target);
  const filePath = path.endsWith('AGENTS.md') ? path : resolve(path, 'AGENTS.md');

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
      console.error("Run 'agentmd init' to create a sample AGENTS.md");
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseAgentsMd(content, filePath);

  if (opts.json) {
    console.log(
      JSON.stringify({
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
      }),
    );
    return;
  }

  console.log(
    `AGENTS.md: ${parsed.lineCount} lines, ${parsed.sections.length} sections, ${parsed.commands.length} commands`,
  );
  if (parsed.commands.length === 0) {
    console.log("  → Add commands in backticks or code blocks. Run 'agentmd help' for examples.");
  }
  console.log('');

  console.log('Sections:');
  const printSection = (s: { title: string; level: number; children: unknown[] }, indent = '') => {
    console.log(`${indent}${'#'.repeat(s.level)} ${s.title}`);
    for (const c of s.children as { title: string; level: number; children: unknown[] }[]) {
      printSection(c, indent + '  ');
    }
  };
  for (const s of parsed.sections) {
    printSection(s);
  }

  if (parsed.commands.length > 0) {
    console.log('\nExtracted commands:');
    for (const c of parsed.commands) {
      console.log(`  [${c.type}] ${c.command} (${c.section}, line ${c.line})`);
    }
  }
}

function cmdCompose(target: string) {
  const root = resolve(target);
  const result = composeAgentsMd(root);

  if (result.generated.length === 0) {
    console.log('No fragments found. Add files matching **/agents-md/**/*.md or **/*.agents.md');
    return;
  }

  console.log(`Composed ${result.generated.length} AGENTS.md file(s):\n`);
  for (const g of result.generated) {
    console.log(`  ${g.path} (${g.content.split('\n').length} lines)`);
  }
}

async function cmdRun(opts: { target: string; json: boolean; extra: string[] }) {
  const includeOutput = opts.extra.includes('--include-output');

  // Validate types early so we fail with "Unknown command type" before file checks
  const typeArgs = opts.extra.filter(
    (a) => a !== '--dry-run' && a !== '--use-shell' && a !== '--include-output',
  );
  const types = parseRequestedTypes(typeArgs);

  const path = resolve(opts.target);
  const filePath = path.endsWith('AGENTS.md') ? path : resolve(path, 'AGENTS.md');

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseAgentsMd(content, filePath);
  const dryRun = opts.extra.includes('--dry-run');
  const useShell = opts.extra.includes('--use-shell');

  if (parsed.commands.length === 0) {
    if (opts.json) {
      console.log(
        JSON.stringify({ ok: false, error: 'No executable commands found in AGENTS.md' }),
      );
    } else {
      console.log('No executable commands found in AGENTS.md');
      console.log('Add commands in backticks (e.g. `pnpm test`) or code blocks.');
    }
    process.exit(1);
  }
  const toRun = types ? parsed.commands.filter((c) => types.includes(c.type)) : parsed.commands;

  const plan = await planCommandExecutions(toRun, {
    useShell,
    permissions: parsed.frontmatter?.permissions as NonNullable<
      Parameters<typeof executeCommands>[1]
    >['permissions'],
  });
  if (plan.blockedCount > 0) {
    console.log(
      `Preflight: ${plan.runnableCount}/${plan.items.length} command(s) runnable, ${plan.blockedCount} blocked.`,
    );
    for (const item of plan.items.filter((entry) => !entry.runnable)) {
      console.log(`  ✗ ${item.command}`);
      for (const reason of item.reasons) {
        console.log(`      - ${reason}`);
      }
    }
    console.log('');
  }
  const runnableCommands = plan.items
    .filter((item) => item.runnable)
    .map((item) => toRun.find((cmd) => cmd.command === item.command && cmd.line === item.line))
    .filter((cmd): cmd is NonNullable<typeof cmd> => Boolean(cmd));

  if (runnableCommands.length === 0) {
    if (opts.json) {
      console.log(
        JSON.stringify({
          ok: false,
          error: 'No runnable commands after preflight',
          blockedCount: plan.blockedCount,
          plan,
          blocked: plan.items
            .filter((i) => !i.runnable)
            .map((i) => ({
              command: i.command,
              type: i.type,
              section: i.section,
              line: i.line,
              reasons: i.reasons,
              reasonDetails: (i as { reasonDetails?: string }).reasonDetails,
              requiresShell: i.requiresShell,
              requiresApproval: i.requiresApproval,
            })),
        }),
      );
    } else {
      console.log('No runnable commands after preflight.');
      if (!useShell && plan.items.some((item) => item.requiresShell)) {
        console.log('Hint: rerun with --use-shell for commands that require shell operators.');
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
    cwd: path.endsWith('AGENTS.md') ? resolve(path, '..') : path,
    permissions: parsed.frontmatter?.permissions as NonNullable<
      Parameters<typeof executeCommands>[1]
    >['permissions'],
  });

  let failed = 0;
  for (const r of results) {
    if (!r.success) failed++;
  }

  if (opts.json) {
    const MAX_OUTPUT_CHARS = 20_000;
    const truncate = (value: string) =>
      value.length > MAX_OUTPUT_CHARS
        ? value.slice(0, MAX_OUTPUT_CHARS) + `\n…(truncated, ${value.length} chars total)`
        : value;

    const output = {
      ok: failed === 0 && plan.blockedCount === 0,
      dryRun,
      plan,
      blockedCount: plan.blockedCount,
      blocked: plan.items
        .filter((i) => !i.runnable)
        .map((i) => ({
          command: i.command,
          type: i.type,
          section: i.section,
          line: i.line,
          reasons: i.reasons,
          reasonDetails: (i as { reasonDetails?: string }).reasonDetails,
          requiresShell: i.requiresShell,
          requiresApproval: i.requiresApproval,
        })),
      results: results.map((r) => {
        const base: Record<string, unknown> = {
          command: r.command,
          type: r.type,
          success: r.success,
          exitCode: r.exitCode,
          durationMs: r.durationMs,
          error: r.error,
        };
        if (includeOutput) {
          base.stdout = truncate(r.stdout ?? '');
          base.stderr = truncate(r.stderr ?? '');
        }
        return base;
      }),
    };
    console.log(JSON.stringify(output));
  } else {
    for (const r of results) {
      const icon = r.success ? '✓' : '✗';
      const status = r.success ? '' : ` (${r.error ?? r.exitCode})`;
      console.log(`  ${icon} [${r.type}] ${r.command}${status}`);
      if (!r.success && r.stderr) {
        console.log(`      ${r.stderr.slice(0, 100)}${r.stderr.length > 100 ? '...' : ''}`);
      }
    }

    if (!useShell) {
      const hasShellBlocked = results.some((r) =>
        (r.error ?? '').includes('requires shell features'),
      );
      if (hasShellBlocked) {
        console.log('\nHint: rerun with --use-shell for commands that require shell operators.');
      }
    }

    if (plan.blockedCount > 0) {
      console.error(
        `Execution incomplete: ${plan.blockedCount} command(s) were blocked during preflight.`,
      );
      failed += plan.blockedCount;
    }
  }

  if (failed > 0) process.exit(1);
}

async function cmdDoctor(target: string) {
  const path = resolve(target);
  const filePath = path.endsWith('AGENTS.md') ? path : resolve(path, 'AGENTS.md');

  if (!existsSync(filePath)) {
    console.error(`AGENTS.md not found at ${filePath}`);
    console.log('Run: agentmd init');
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseAgentsMd(content, filePath);
  const validation = await validateAgentsMd(parsed);
  const score = await computeAgentReadinessScore(parsed);
  const plan = await planCommandExecutions(parsed.commands, {
    permissions: parsed.frontmatter?.permissions as NonNullable<
      Parameters<typeof executeCommands>[1]
    >['permissions'],
    useShell: false,
  });

  console.log(`Doctor report for ${filePath}`);
  console.log(
    `Summary: ${parsed.sections.length} sections, ${parsed.commands.length} commands, score ${score}/100`,
  );
  console.log(
    `Execution preflight: ${plan.runnableCount} runnable, ${plan.blockedCount} blocked (safe mode)`,
  );

  if (validation.errors.length > 0) {
    console.log('\nErrors:');
    for (const error of validation.errors.slice(0, 10)) {
      console.log(`  ✗ ${error.message}${error.line ? ` (line ${error.line})` : ''}`);
    }
  }
  if (validation.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of validation.warnings.slice(0, 10)) {
      console.log(`  ⚠ ${warning.message}${warning.line ? ` (line ${warning.line})` : ''}`);
    }
  }
  if (validation.suggestions.length > 0) {
    console.log('\nSuggested improvements:');
    for (const suggestion of validation.suggestions.slice(0, 8)) {
      console.log(`  • ${suggestion}`);
    }
  }
  const blocked = plan.items.filter((item) => !item.runnable);
  if (blocked.length > 0) {
    console.log('\nBlocked commands:');
    for (const item of blocked.slice(0, 10)) {
      console.log(`  ✗ ${item.command}`);
      for (const reason of item.reasons.slice(0, 2)) {
        console.log(`      - ${reason}`);
      }
    }
  }

  console.log('\nNext steps:');
  console.log('  1. Run `agentmd check --contract` to review full validation output.');
  console.log('  2. Run `agentmd run . --dry-run` to preview execution.');
  if (blocked.some((item) => item.requiresShell)) {
    console.log('  3. If needed, rerun with `agentmd run . --use-shell` for shell operators.');
  } else {
    console.log('  3. Run `agentmd run .` once preflight is clean.');
  }
}

async function cmdImprove(opts: { target: string; apply: boolean; json: boolean }) {
  const path = resolve(opts.target);
  const filePath = path.endsWith('AGENTS.md') ? path : resolve(path, 'AGENTS.md');
  const dir = path.endsWith('AGENTS.md') ? resolve(path, '..') : path;

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
      console.error("Run 'agentmd init' to create a sample AGENTS.md");
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseAgentsMd(content, filePath);
  await validateAgentsMd(parsed);
  const scoreBefore = await computeAgentReadinessScore(parsed);

  const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);
  const sectionTitles = parsed.sections.map((s) => s.title.toLowerCase());
  const hasInstallSection = sectionTitles.some((t) => t.includes('install') || t.includes('setup'));

  const improvements: string[] = [];
  let newBody = body;
  const newFrontmatter =
    hasFrontmatter && Object.keys(frontmatter).length > 0
      ? ({ ...frontmatter } as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  if (!hasInstallSection && parsed.sections.length > 0) {
    const pm = existsSync(resolve(dir, 'pnpm-lock.yaml'))
      ? 'pnpm'
      : existsSync(resolve(dir, 'yarn.lock'))
        ? 'yarn'
        : 'npm';
    const installBlock = `## Install\n\n\`${pm} install\`\n\n`;
    const firstHeading = newBody.search(/^##\s/m);
    if (firstHeading >= 0) {
      newBody = newBody.slice(0, firstHeading) + installBlock + newBody.slice(firstHeading);
    } else {
      newBody = installBlock + newBody;
    }
    improvements.push('Added Install section');
  }

  let pkgName: string | undefined;
  try {
    const pkgPath = resolve(dir, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { name?: string };
      pkgName = typeof pkg?.name === 'string' ? pkg.name : undefined;
    }
  } catch {
    /* ignore */
  }

  const needsName = !frontmatter?.name || String(frontmatter.name).trim() === '';
  if (needsName && pkgName) {
    newFrontmatter.name = pkgName;
    improvements.push(`Added frontmatter name: ${pkgName}`);
  }

  const needsPurpose = !frontmatter?.purpose || String(frontmatter.purpose).trim() === '';
  if (needsPurpose && (Object.keys(newFrontmatter).length > 0 || improvements.length > 0)) {
    newFrontmatter.purpose = 'Agent instructions for this project';
    improvements.push('Added frontmatter purpose');
  }

  const newContent =
    Object.keys(newFrontmatter).length > 0 ? stringifyAgentsMd(newBody, newFrontmatter) : newBody;

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
      }),
    );
    if (opts.apply && improvements.length > 0) {
      writeFileSync(filePath, newContent, 'utf-8');
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
    writeFileSync(filePath, newContent, 'utf-8');
    console.log(`\n✓ Applied ${improvements.length} improvement(s) to ${filePath}`);
  } else {
    console.log(`\nRun 'agentmd improve --apply' to apply these changes.`);
  }
}

const ALLOWED_COMMAND_TYPES: CommandType[] = [
  'build',
  'test',
  'lint',
  'format',
  'install',
  'setup',
  'deploy',
  'security',
  'other',
];

function parseRequestedTypes(typeArgs: string[]): CommandType[] | undefined {
  if (typeArgs.length === 0) return undefined;

  const invalid = typeArgs.filter((arg) => !ALLOWED_COMMAND_TYPES.includes(arg as CommandType));
  if (invalid.length > 0) {
    console.error(`Unknown command type(s): ${invalid.join(', ')}`);
    console.error(`Allowed types: ${ALLOWED_COMMAND_TYPES.join(', ')}`);
    process.exit(1);
  }

  return typeArgs as CommandType[];
}

async function cmdScore(opts: { target: string; json: boolean }) {
  const path = resolve(opts.target);
  const filePath = path.endsWith('AGENTS.md') ? path : resolve(path, 'AGENTS.md');

  if (!existsSync(filePath)) {
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: `AGENTS.md not found at ${filePath}` }));
    } else {
      console.error(`AGENTS.md not found at ${filePath}`);
      console.error("Run 'agentmd init' to create a sample AGENTS.md");
    }
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseAgentsMd(content, filePath);
  const score = await computeAgentReadinessScore(parsed);

  if (opts.json) {
    console.log(JSON.stringify({ ok: true, score }));
    return;
  }

  console.log(`Agent-readiness score: ${score}/100`);
  if (score < 50) console.log('  → Add sections, commands, and frontmatter to improve.');
  else if (score < 80) console.log('  → Consider adding frontmatter and guardrails.');
  else console.log('  → AGENTS.md is well-structured for agent use.');
}

async function cmdExport(target: string) {
  const path = resolve(target);
  const filePath = path.endsWith('AGENTS.md') ? path : resolve(path, 'AGENTS.md');

  if (!existsSync(filePath)) {
    console.error(`AGENTS.md not found at ${filePath}`);
    console.error("Run 'agentmd init' to create a sample AGENTS.md");
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseAgentsMd(content, filePath);
  const yaml = await exportToGitHubActions(parsed);
  console.log(yaml);
}

// ─── Auth commands ───────────────────────────────────────────────────────────

async function cmdLogin(): Promise<void> {
  const existing = readCredentials();
  if (existing) {
    console.log(`Already logged in to ${existing.dashboardUrl}`);
    console.log(`Run 'agentmd logout' first to log in with a different account.`);
    return;
  }

  // 1. Initiate device flow
  let deviceCode: string;
  let userCode: string;
  let verificationUrl: string;
  try {
    const res = await nodeFetch(`${DASHBOARD_URL}/api/auth/device/initiate`, {
      method: 'POST',
      body: '{}',
      timeoutMs: 10_000,
    });
    if (!res.ok) {
      console.error(`Failed to start login flow (HTTP ${res.status}).`);
      console.error('Make sure the dashboard is running or set AGENTMD_DASHBOARD_URL.');
      process.exit(1);
    }
    const data = JSON.parse(res.body) as { deviceCode: string; userCode: string; verificationUrl: string };
    deviceCode = data.deviceCode;
    userCode = data.userCode;
    verificationUrl = data.verificationUrl;
  } catch (err) {
    console.error(`Cannot reach dashboard: ${err instanceof Error ? err.message : err}`);
    console.error('Set AGENTMD_DASHBOARD_URL if using a self-hosted instance.');
    process.exit(1);
  }

  // 2. Prompt user
  console.log(`\n  AgentMD Login`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  Open this URL in your browser:`);
  console.log(`  ${verificationUrl}`);
  console.log(``);
  console.log(`  Your device code: ${userCode}`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  Waiting for approval… (Ctrl-C to cancel)\n`);

  // 3. Poll until approved or timed out (60 s)
  const deadline = Date.now() + 60_000;
  const INTERVAL_MS = 3_000;
  let token: string | null = null;

  while (Date.now() < deadline) {
    await new Promise<void>((r) => setTimeout(r, INTERVAL_MS));
    try {
      const res = await nodeFetch(
        `${DASHBOARD_URL}/api/auth/device/poll?code=${encodeURIComponent(deviceCode)}`,
        { timeoutMs: 8_000 },
      );
      if (res.ok) {
        const data = JSON.parse(res.body) as { status: string; token?: string };
        if (data.status === 'approved' && data.token) {
          token = data.token;
          break;
        }
        if (data.status === 'expired') {
          console.error('Login code expired. Run agentmd login again.');
          process.exit(1);
        }
      }
    } catch {
      // transient — keep polling
    }
    process.stdout.write('.');
  }

  if (!token) {
    console.error('\nLogin timed out. Run agentmd login again.');
    process.exit(1);
  }

  // 4. Save credentials
  writeCredentials({ token, dashboardUrl: DASHBOARD_URL, createdAt: new Date().toISOString() });
  console.log(`\n\n  ✓ Logged in to ${DASHBOARD_URL}`);
  console.log(`  Credentials saved to ${CREDENTIALS_FILE}`);
  console.log(`  Run 'agentmd whoami' to verify.\n`);
}

function cmdLogout(): void {
  const removed = deleteCredentials();
  if (removed) {
    console.log('Logged out. Credentials removed.');
  } else {
    console.log('Not logged in.');
  }
}

function cmdWhoami(): void {
  const creds = readCredentials();
  if (!creds) {
    console.log('Not logged in. Run "agentmd login".');
    process.exit(1);
  }
  console.log(`Logged in to ${creds.dashboardUrl}`);
  console.log(`Token: ${creds.token.slice(0, 8)}…  (created ${new Date(creds.createdAt).toLocaleDateString()})`);
}

// ─── Help ────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
AgentMD — CI/CD for AI Agents. Makes AGENTS.md executable.

Usage: agentmd <command> [path] [options]

Commands:
  init [path]            Create AGENTS.md (auto-detects project type, use --template to override)
  doctor [path]          Diagnose AGENTS.md quality and runnable commands
  check [path]           Validate AGENTS.md (flags: --contract, --output <file>, --json)
  validate [path]        Alias for check
  improve [path]         Self-improve AGENTS.md from validation feedback (use --apply to write)
  discover [path]        Find all AGENTS.md in repo
  parse [path]           Parse and show structure
  compose [path]         Build AGENTS.md from fragments
  run [path] [types]     Execute commands (flags: --dry-run, --use-shell, --include-output, --json)
  score [path]           Agent-readiness score (0-100)
  export [path]          Generate GitHub Actions workflow YAML
  login                  Log in to AgentMD (links CLI to your account for Pro/Enterprise features)
  logout                 Remove stored credentials
  whoami                 Show current login status
  help                   Show this help

Quick start:
  agentmd init                    # Auto-detect project type
  agentmd init --template python  # Force Python template
  agentmd doctor                  # Diagnose and get next steps
  agentmd check --contract        # Check contract coverage
  agentmd score                   # Get your score
  agentmd run . --dry-run         # Preview execution
  agentmd login                   # Link CLI to your AgentMD account

See https://agents.md for the AGENTS.md standard.
`);
}

main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
