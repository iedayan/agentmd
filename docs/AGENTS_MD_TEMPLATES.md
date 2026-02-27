# AGENTS.md Templates

Templates for popular frameworks. Use `agentmd init` for a starter file, or copy manually.

## Next.js

```markdown
---
agent:
  name: nextjs-agent
  purpose: "Work on Next.js projects"
  guardrails:
    - "Run tests before committing"
    - "Never modify .env.local in production paths"
---

# Next.js Project

## Setup
- Run `pnpm install` from repo root.

## Build
- `pnpm run build`

## Test
- `pnpm test` or `pnpm run test` before committing.

## Lint
- `pnpm run lint` for ESLint.

## PR guidelines
- Title: [scope] Brief description
- Always run `pnpm test` and `pnpm run lint`.
```

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

## Django

```markdown
---
agent:
  name: django-agent
  purpose: "Work on Django projects"
  guardrails:
    - "Run tests before committing"
    - "Never run migrate without explicit approval"
---

# Django Project

## Setup
- `uv sync` or `pip install -r requirements.txt`
- Copy `.env.example` to `.env` if present

## Migrations
- `python manage.py makemigrations` (creates migrations)
- `python manage.py migrate` (apply — requires approval in production)

## Test
- `python manage.py test` or `pytest`

## Lint
- `ruff check .` and `ruff format .`

## PR guidelines
- Add tests for new code.
- Run migrations in a separate commit.
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

## Ruby on Rails

```markdown
---
agent:
  name: rails-agent
  purpose: "Work on Ruby on Rails projects"
  guardrails:
    - "Run tests before committing"
    - "Never run db:migrate in production without approval"
---

# Rails Project

## Setup
- `bundle install`

## Database
- `bin/rails db:create db:migrate` (development)
- `bin/rails db:migrate` (apply migrations — approval required for production)

## Test
- `bundle exec rspec` or `bin/rails test`

## Lint
- `bundle exec rubocop` and `bundle exec erblint .`

## PR guidelines
- Add tests for new code.
- Keep migrations reversible when possible.
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

## Monorepo (pnpm workspaces)

```markdown
---
agent:
  name: monorepo-agent
  purpose: "Work on pnpm monorepo projects"
  guardrails:
    - "Run tests from repo root"
    - "Use pnpm --filter for package-scoped commands"
---

# Monorepo

## Setup
- `pnpm install` from repo root.

## Build
- `pnpm run build` (runs all packages)
- `pnpm --filter <package> run build` for a single package.

## Test
- `pnpm run test` from root.
- `pnpm --filter <package> run test` for a single package.

## Lint
- `pnpm run lint` from root.

## PR guidelines
- Title: [package] Brief description
- Run full test suite before merging.
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
