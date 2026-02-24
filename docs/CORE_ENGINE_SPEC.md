# AgentMD Core Engine Specification

## 1. AGENTS.md Parser with Schema Validation

### YAML Frontmatter Schema

Supports both flat and nested `agent:` structure:

```yaml
---
agent:
  name: string           # Agent identifier
  purpose: string        # Human-readable purpose
  model: string          # AI model (gpt-4o-mini, claude-3-sonnet)
  triggers: string[]     # pull_request.opened, push, etc.
  permissions:           # Permission boundaries
    files: { read, edit, delete }
    shell: { allow: [], deny: [], default }
    browser: { allow: [] }
    pull_requests: read|write|none
    issues: read|write|none
    contents: read|write|none
  guardrails: string[]   # "Never modify code", "Never merge"
  metadata: Record       # Custom key-value
---
```

### Markdown Directives

`<!-- agents-md: key=value -->` style:

- `target=nearest` | `target=root` | `target=path` — Where to compose
- `priority=N` — Ordering (higher = earlier)
- `heading=Title` — Optional section heading
- `import=@path` — Import another fragment

### Plain-Text Sections

Extracted: Setup commands, Testing instructions, Code style, PR guidelines, etc.

## 2. Multi-File Composition Engine

### Fragment Patterns

- `**/agents-md/**/*.md`
- `**/*.agents.md`

### CLI: `agentmd compose [path]`

1. Discover fragments via globs
2. Apply directives for target/priority
3. Compose canonical AGENTS.md per target directory
4. Add source annotations: `<!-- source: path -->`

### Config (future: agentmd.config.js)

```js
export default {
  include: ["**/agents-md/**/*.md", "**/*.agents.md"],
  exclude: ["**/node_modules/**"],
  defaultTarget: "nearest",
  annotateSources: true,
};
```

## 3. Execution Environment

### Sandboxed Runners

- **Shell** — spawn with cwd, timeout, env
- **Safety** — Block dangerous patterns (rm -rf /, chmod 777, etc.)
- **Permissions** — Enforce shell.allow/deny from frontmatter

### Execution Flow

1. Parse AGENTS.md
2. Extract commands
3. Check `isCommandSafe()`
4. Check `isCommandAllowed(permissions)`
5. Execute with timeout
6. Return ExecutionResult (success, duration, stdout, stderr)

### CLI: `agentmd run [path] [types]`

Types: build, test, lint. Filters commands by type.

## 4. GitHub Integration

### Workflow: `.github/workflows/validate-agents-md.yml`

- Triggers: push/PR when AGENTS.md or fragments change
- Steps: validate, score, run tests
- Status checks on PR

### Badge

See `.github/AGENTS_MD_BADGE.md` for badge markdown.

## 5. Validation & Linting

### Rules

- Required: non-empty
- Recommended: <150 lines, has sections
- Safety: no dangerous commands (rm -rf, etc.)
- Permissions: validate shell.allow/deny consistency

### Agent-Readiness Score (0-100)

- Content: 10
- Sections: 20
- Commands: 25
- Frontmatter: 15
- Recommended sections (testing, build, PR): 15
- All commands safe: 15
