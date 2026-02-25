# AgentMD Phase 0 Specification

**Focus**: Deep AGENTS.md integration — parse, validate, discover, extract.

## Goals

1. **Parse** — Extract sections, structure, and content from AGENTS.md
2. **Validate** — Check format against the standard and best practices
3. **Discover** — Find root and nested AGENTS.md in monorepos
4. **Extract** — Identify executable commands (build, test, lint, etc.)
5. **SDK** — Programmatic API for integrations (GitHub Actions, IDEs, etc.)

## AGENTS.md Standard Reference

- **Format**: Plain Markdown, no schema, no required fields
- **Location**: Project root (or nested in subpackages)
- **Length**: Recommended under 150 lines
- **Sections**: Common ones include Testing, Build, PR guidelines, Code style, Security
- **Commands**: Listed in backticks; agents execute relevant checks

Source: [agents.md](https://agents.md)

## Output Contract Section (Extension)

To standardize agent outcomes across tools, AgentMD supports an `output_contract`
frontmatter section with required fields:

- `format`: expected output format (`json`, `markdown`, `text`)
- `schema`: required output keys and type expectations
- `quality_gates`: checks that must pass
- `artifacts`: required files/ids to produce
- `exit_criteria`: completion conditions that must be met

Example:

```yaml
output_contract:
  format: json
  schema:
    summary: string
    files_changed: array
  quality_gates:
    - tests_pass
    - lint_pass
  artifacts:
    - patches
    - test_report
  exit_criteria:
    - zero_blockers
    - ready_for_review
```

## Phase 0 Deliverables

### @agentmd/core

| Module | Purpose |
|--------|---------|
| `parser` | Parse markdown → sections, content |
| `commands` | Extract executable commands from content |
| `validator` | Validate against standard + best practices |
| `discovery` | Find AGENTS.md files (root + nested) |

### @agentmd/cli

| Command | Purpose |
|---------|---------|
| `agentmd check [path] --contract` | Validate AGENTS.md + required output contract |
| `agentmd check [path] --contract --output agent-output.json` | Validate output payload against contract |
| `agentmd validate [path]` | Alias for `check` |
| `agentmd discover [path]` | List all AGENTS.md in repo |
| `agentmd parse [path]` | Show parsed structure + commands |

### @agentmd/sdk

- Re-exports core with stable API
- For use in GitHub Actions, VS Code extensions, etc.

## Out of Scope (Phase 1+)

- **Execution** — Actually running commands (Phase 1)
- **GitHub integration** — Webhooks, PR checks (Phase 1)
- **Dashboard** — Web UI (Phase 1)
- **Human-in-the-loop** — Approval flows (Phase 2)
