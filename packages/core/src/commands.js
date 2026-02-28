/**
 * Command Extraction from AGENTS.md
 * Extracts executable commands from AGENTS.md content for orchestration.
 */
// Patterns that suggest executable commands
const COMMAND_PATTERNS = [
  // Backtick-wrapped: `pnpm test`, `cargo build`
  /`([^`]+)`/g,
  // "Run X" or "run X" patterns
  /\b(?:run|execute|invoke)\s+[`']?([a-zA-Z0-9_./\s-]+)[`']?/gi,
  // Bullet with command-like content
  /^[-*]\s+(?:run\s+)?`?([a-zA-Z][a-zA-Z0-9_\s./-]+)`?/gm,
  // Code block lines (bash, sh, shell, zsh, powershell)
  /```(?:bash|sh|shell|zsh|powershell|ps1)\n([\s\S]*?)```/g,
  // Plain code blocks (no lang) - common in AGENTS.md
  /```\n([\s\S]*?)```/g,
  // Shell prompt convention: $ pnpm test or % cargo build
  /^[$%]\s+([a-zA-Z][a-zA-Z0-9_\s./-]+)$/gm,
];
// Keywords to infer command type
const TYPE_KEYWORDS = {
  build: ['build', 'compile', 'make', 'go build', 'cargo build', 'bun run build', 'deno build'],
  test: [
    'test',
    'pytest',
    'jest',
    'vitest',
    'cargo test',
    'pnpm test',
    'npm test',
    'go test',
    'bun test',
    'deno test',
    'uv run pytest',
    'poetry run pytest',
  ],
  lint: ['lint', 'eslint', 'ruff', 'clippy', 'golangci-lint', 'flake8', 'mypy'],
  format: ['fmt', 'format', 'prettier', 'rustfmt', 'black', 'dart format'],
  install: [
    'install',
    'uv sync',
    'pnpm install',
    'npm install',
    'yarn',
    'cargo fetch',
    'bun install',
    'pip install',
    'pipenv install',
    'bundle install',
  ],
  setup: ['setup', 'uv venv', 'breeze', 'poetry install', 'venv', 'nvm use'],
  deploy: [
    'deploy',
    'release',
    'publish',
    'kubectl apply',
    'helm upgrade',
    'docker compose up',
    'docker-compose up',
    'docker compose',
  ],
  security: [
    'audit',
    'npm audit',
    'pnpm audit',
    'yarn audit',
    'snyk',
    'trivy',
    'grype',
    'dependency-check',
    'safety',
    'bandit',
    'semgrep',
  ],
  other: [],
};
/**
 * Extract executable commands from AGENTS.md content and sections.
 */
export function extractCommands(content, sections) {
  const commands = [];
  const seen = new Set();
  const lines = content.split('\n');
  // Build section map by line number and section content
  const sectionByLine = buildSectionMap(sections);
  const sectionContentByLine = buildSectionContentMap(sections);
  // Extract from backticks and inline patterns
  for (const pattern of COMMAND_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      let raw = match[1].trim();
      // Strip leading $ or % from shell-prompt pattern
      if (/^[$%]\s+/.test(raw)) raw = raw.replace(/^[$%]\s+/, '');
      const isCodeBlock = pattern.source.includes('```');
      const blockStartLine = isCodeBlock
        ? getLineNumber(content, match.index) + 1
        : getLineNumber(content, match.index);
      if (isCodeBlock) {
        const items = splitCodeBlockLinesWithLineNumbers(raw);
        for (const { command: candidate, lineInBlock } of items) {
          const trimmed = candidate.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          if (isLikelyCommand(trimmed) && !seen.has(normalizeCommand(trimmed))) {
            seen.add(normalizeCommand(trimmed));
            const lineNum = blockStartLine + lineInBlock - 1;
            const section = sectionByLine.get(lineNum) ?? 'General';
            const context = extractContext(sectionContentByLine.get(lineNum) ?? '');
            commands.push({
              command: trimmed,
              section,
              line: lineNum,
              type: inferCommandType(trimmed),
              context: context || undefined,
            });
          }
        }
      } else {
        const candidates = splitCommandChain(raw);
        const lineNum = blockStartLine;
        for (const candidate of candidates) {
          const trimmed = candidate.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          if (isLikelyCommand(trimmed) && !seen.has(normalizeCommand(trimmed))) {
            seen.add(normalizeCommand(trimmed));
            const section = sectionByLine.get(lineNum) ?? 'General';
            const context = extractContext(sectionContentByLine.get(lineNum) ?? '');
            commands.push({
              command: trimmed,
              section,
              line: lineNum,
              type: inferCommandType(trimmed),
              context: context || undefined,
            });
          }
        }
      }
    }
  }
  // Also scan lines for common command starters
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (
      (trimmed.startsWith('- ') || trimmed.startsWith('* ')) &&
      (trimmed.includes('`') || /^(run|execute)\s+/i.test(trimmed))
    ) {
      const extracted = extractCommandFromLine(trimmed);
      if (extracted && !seen.has(normalizeCommand(extracted))) {
        seen.add(normalizeCommand(extracted));
        const section = sectionByLine.get(i + 1) ?? 'General';
        const context = extractContext(sectionContentByLine.get(i + 1) ?? '');
        commands.push({
          command: extracted,
          section,
          line: i + 1,
          type: inferCommandType(extracted),
          context: context || undefined,
        });
      }
    }
  }
  return commands.sort((a, b) => a.line - b.line);
}
function buildSectionMap(sections) {
  const map = new Map();
  const visit = (s) => {
    for (let i = s.lineStart; i <= s.lineEnd; i++) {
      map.set(i, s.title);
    }
    s.children.forEach(visit);
  };
  sections.forEach(visit);
  return map;
}
function buildSectionContentMap(sections) {
  const map = new Map();
  const visit = (s, content) => {
    for (let i = s.lineStart; i <= s.lineEnd; i++) {
      map.set(i, content);
    }
    s.children.forEach((c) => visit(c, c.content || content));
  };
  sections.forEach((s) => visit(s, s.content || ''));
  return map;
}
function getLineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}
function isLikelyCommand(s) {
  if (s.length < 4 || s.length > 150) return false;
  if (!/^[a-zA-Z0-9_./-]/.test(s)) return false;
  if (s.startsWith('http') || s.startsWith('//')) return false;
  if (s.endsWith('.md') || s.endsWith('.json')) return false;
  // Reject paths like "packages/core", "apps/web"
  if (/^[a-z]+\/[a-z-]+$/.test(s)) return false;
  // Accept: multi-word commands, or known runners
  const knownRunners =
    /^(pnpm|npm|npx|yarn|cargo|uv|python|node|just|pytest|vitest|go|make|bun|bunx|deno|poetry|docker|docker-compose|docker compose|tsx|ts-node|nx)\s/;
  return /\s/.test(s) || knownRunners.test(s);
}
function normalizeCommand(cmd) {
  return cmd.replace(/\s+/g, ' ').trim().toLowerCase();
}
/** Split multi-line code block into commands with line numbers (1-based within block). */
function splitCodeBlockLinesWithLineNumbers(block) {
  const trimmed = block.trim();
  // Skip plain blocks that look like JSON/config (avoid false positives)
  if (/^[{[]/.test(trimmed) || trimmed.startsWith('<?xml')) return [];
  const lines = block.split('\n');
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0 || line.startsWith('#')) continue;
    const lineNum = i + 1;
    const parts = splitCommandChain(line);
    for (const cmd of parts) {
      result.push({ command: cmd, lineInBlock: lineNum });
    }
  }
  return result;
}
/** Split "cmd1 && cmd2" or "cmd1; cmd2" into individual commands. */
function splitCommandChain(line) {
  const parts = [];
  let current = '';
  let i = 0;
  let inQuote = false;
  let quoteChar = '';
  while (i < line.length) {
    const c = line[i];
    if (!inQuote) {
      if (c === '"' || c === "'" || c === '`') {
        inQuote = true;
        quoteChar = c;
        current += c;
        i++;
        continue;
      }
      if (c === '&' && line[i + 1] === '&') {
        const trimmed = current.trim();
        if (trimmed) parts.push(trimmed);
        current = '';
        i += 2;
        continue;
      }
      if (c === ';' && !/^\s*$/.test(current)) {
        const trimmed = current.trim();
        if (trimmed) parts.push(trimmed);
        current = '';
        i++;
        continue;
      }
    } else {
      if (c === quoteChar && (i === 0 || line[i - 1] !== '\\')) {
        inQuote = false;
      }
    }
    current += c;
    i++;
  }
  const trimmed = current.trim();
  if (trimmed) parts.push(trimmed);
  return parts;
}
function extractCommandFromLine(line) {
  const backtick = /`([^`]+)`/.exec(line);
  if (backtick) return backtick[1].trim();
  const runMatch = /(?:run|execute)\s+([a-zA-Z][a-zA-Z0-9_\s./-]+)/i.exec(line);
  if (runMatch) return runMatch[1].trim();
  return null;
}
/** Extract cwd/context hints from section content (e.g. "in packages/core", "from apps/web"). */
function extractContext(sectionContent) {
  // "in packages/core", "from packages/core directory", "under apps/web"
  const inDir =
    /\b(?:in|from|under|inside|within)\s+[`']?([a-zA-Z0-9_./-]+)[`']?(?:\s+directory)?\b/i.exec(
      sectionContent,
    );
  if (inDir) return inDir[1];
  // "cd packages/core", "run from packages/core"
  const cdDir = /\bcd\s+([a-zA-Z0-9_./-]+)\b/i.exec(sectionContent);
  if (cdDir) return cdDir[1];
  const runFrom = /\b(?:run\s+)?from\s+[`']?([a-zA-Z0-9_./-]+)[`']?/i.exec(sectionContent);
  if (runFrom) return runFrom[1];
  // "working directory: packages/core", "cwd: packages/core", "cwd=packages/core"
  const workingDir = /\b(?:working\s+directory|cwd)\s*[=:]\s*[`']?([a-zA-Z0-9_./-]+)[`']?/i.exec(
    sectionContent,
  );
  if (workingDir) return workingDir[1];
  return null;
}
/** Prefer longer/more specific keyword matches. Prefer suffix matches (e.g. "build:test" -> test). */
function inferCommandType(command) {
  const lower = command.toLowerCase();
  let best = null;
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (type === 'other') continue;
    for (const k of keywords) {
      if (!lower.includes(k)) continue;
      const idx = lower.indexOf(k);
      const atSuffix = idx + k.length >= lower.length;
      const score = { type: type, keywordLen: k.length, atSuffix };
      if (
        !best ||
        (score.atSuffix && !best.atSuffix) ||
        (score.atSuffix === best.atSuffix && score.keywordLen > best.keywordLen)
      ) {
        best = score;
      }
    }
  }
  return best?.type ?? 'other';
}
/** Suggested execution order: install -> setup -> build -> lint -> format -> test -> deploy -> other */
const EXECUTION_ORDER = ['install', 'setup', 'build', 'lint', 'format', 'test', 'deploy', 'other'];
/**
 * Return commands in suggested execution order.
 * Use for CI pipelines: install deps, build, lint, test, deploy.
 */
export function getSuggestedExecutionOrder(commands) {
  const orderMap = new Map(EXECUTION_ORDER.map((t, i) => [t, i]));
  return [...commands].sort((a, b) => {
    const aOrder = orderMap.get(a.type) ?? 999;
    const bOrder = orderMap.get(b.type) ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.line - b.line;
  });
}
