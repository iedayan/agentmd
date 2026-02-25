---
name: agentmd
description: Execute, validate, and score AGENTS.md files via the AgentMD CLI. Use when running agentmd commands, validating AGENTS.md, computing agent-readiness scores, exporting GitHub Actions workflows, or working with AgentMD governance templates.
---

# AgentMD CLI

AgentMD makes AGENTS.md executable. This skill guides correct usage of the CLI for validation, execution, and scoring.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `agentmd init [path]` | Create AGENTS.md (auto-detects project type) |
| `agentmd check [path]` | Validate AGENTS.md |
| `agentmd check --contract` | Validate with output contract |
| `agentmd score [path]` | Agent-readiness score (0–100) |
| `agentmd run [path] [types]` | Execute commands (build, test, lint) |
| `agentmd compose [path]` | Build AGENTS.md from fragments |
| `agentmd doctor [path]` | Diagnose quality and next steps |
| `agentmd export [path]` | Generate GitHub Actions YAML |

## When to Use Each Command

**Creating AGENTS.md**
```bash
agentmd init                    # Auto-detect (Node, Python, Rust, Go)
agentmd init --template python  # Force template
```

**Validation**
```bash
agentmd check .                 # Basic validation
agentmd check . --contract      # Require output_contract in frontmatter
agentmd check . --output out.json  # Write validation result to file
agentmd check . --json          # JSON output
```

**Execution**
```bash
agentmd run . --dry-run         # Preview without executing
agentmd run . test             # Run only test commands
agentmd run . build test       # Run build then test
```

**Scoring**
```bash
agentmd score .                # 0–100 agent-readiness score
agentmd score . --json         # JSON output
```

**Composition**
```bash
agentmd compose .               # Merge **/agents-md/**/*.md and **/*.agents.md
```

## Governance Templates

AgentMD supports three built-in templates:

- **baseline-security** — Minimal security (deny dangerous shell, allow read, ask edit)
- **strict-compliance** — Max safety: default-deny shell, output contract required
- **ci-cd-standard** — Triggers (push, PR), contents/pull_requests write

Use `agentmd init --template <id>` or add frontmatter from `@agentmd/core` templates.

## Output Contract

For CI and quality gates, add to frontmatter:

```yaml
output_contract:
  format: json
  schema:
    summary: string
    success: boolean
  quality_gates: ["0 errors", "0 warnings"]
  exit_criteria: ["success is true"]
```

Then: `agentmd check . --contract`

## GitHub Actions

```bash
agentmd export .   # Prints workflow YAML to stdout
```

Redirect to `.github/workflows/agentmd.yml` or use the official AgentMD GitHub Action.

## Path Conventions

- Default path: `.` (current directory)
- Looks for `AGENTS.md` in path or `path/AGENTS.md`
- `agentmd run` uses path's parent as cwd for execution

## Common Workflows

**First-time setup**
```bash
agentmd init
agentmd check . --contract
agentmd score .
```

**CI integration**
```bash
agentmd check . --contract --output agent-output.json
agentmd run . test
```

**Self-improve from validation feedback**
```bash
agentmd improve . --apply
```
