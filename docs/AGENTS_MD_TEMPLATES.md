# AGENTS.md Templates

Templates for popular frameworks. Use `agentmd init` for a starter file, or copy manually.

## Node.js / pnpm

```markdown
---
agent:
  name: node-agent
  purpose: "Work on Node.js/pnpm projects"
  guardrails:
    - "Run tests before committing"
    - "Never modify package-lock.json directly"
---

# Node.js Project

## Setup
- Run `pnpm install` from repo root.

## Build
- `pnpm run build`

## Test
- `pnpm test` before committing.
- Run `pnpm run lint` for ESLint.

## PR guidelines
- Title: [package] Brief description
- Always run `pnpm test` and `pnpm run lint`.
```

## Python / pytest

```markdown
---
agent:
  name: python-agent
  purpose: "Work on Python projects"
  guardrails:
    - "Run pytest before committing"
---

# Python Project

## Setup
- `uv sync` or `pip install -e .`

## Test
- `pytest` or `uv run pytest`
- Run from project root.

## Lint
- `ruff check .` and `ruff format .`

## PR guidelines
- Add tests for new code.
- Follow PEP 8.
```

## Rust / Cargo

```markdown
---
agent:
  name: rust-agent
  purpose: "Work on Rust projects"
  guardrails:
    - "Run cargo clippy and cargo test"
---

# Rust Project

## Build
- `cargo build`

## Test
- `cargo test`

## Lint
- `cargo fmt` and `cargo clippy`

## PR guidelines
- All tests must pass.
- No clippy warnings.
```

## Output Contract Starters

Standardized output contracts for common coding tasks:

- Bugfix PR: [`docs/contracts/bugfix-pr.yaml`](./contracts/bugfix-pr.yaml)
- Refactor: [`docs/contracts/refactor.yaml`](./contracts/refactor.yaml)
- Migration: [`docs/contracts/migration.yaml`](./contracts/migration.yaml)
- Incident fix: [`docs/contracts/incident-fix.yaml`](./contracts/incident-fix.yaml)

Use in CI:

```bash
agentmd check . --contract
agentmd check . --contract --output agent-output.json
```
