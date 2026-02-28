# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repo summary
AgentMD is a pnpm workspace (Node.js >= 20) that makes AGENTS.md files executable.

Key workspace units:
- `packages/core`: parse/validate/compose/discover/execute AGENTS.md
- `packages/cli`: `agentmd` CLI (thin wrapper around core)
- `packages/sdk`: programmatic API for integrations
- `apps/dashboard`: Next.js dashboard (dev server on port 3001)
- `deploy/worker`: background execution worker + deploy scripts/infra

## Setup
- Install deps: `pnpm install`

## Common commands (from repo root)
- Build all packages/apps: `pnpm run build`
- Run all tests (Vitest): `pnpm run test`
- Lint repo (ESLint): `pnpm run lint`
- Fix lint: `pnpm run lint:fix`
- Format (Prettier): `pnpm run format`
- CI-style check: `pnpm run check`

### Package-scoped commands
Use `pnpm --filter <pkg>` to target a package.

Core (`@agentmd/core`):
- Build: `pnpm --filter @agentmd/core run build`
- Typecheck (tsc --noEmit): `pnpm --filter @agentmd/core run lint`
- Tests: `pnpm --filter @agentmd/core run test`
- Single test file: `pnpm --filter @agentmd/core run test -- packages/core/src/__tests__/parser.test.ts`
- Single test by name: `pnpm --filter @agentmd/core run test -- -t "parseAgentsMd"`

pCLI (`@agentmd-dev/cli`):
- Build: `pnpm --filter @agentmd-dev/cli run build`

Dashboard (`@agentmd/dashboard`):
- Dev: `pnpm --filter @agentmd/dashboard run dev` (http://localhost:3001)

## CLI usage (`agentmd`)
Root script `pnpm run agentmd` runs the built CLI at `packages/cli/dist/cli.js`.

- Help: `pnpm run agentmd -- help`
- Validate AGENTS.md (+ output contract): `pnpm run agentmd -- check . --contract`
- Discover nested AGENTS.md files: `pnpm run agentmd -- discover .`
- Compose from fragments: `pnpm run agentmd -- compose .`
- Preflight + dry-run execution: `pnpm run agentmd -- run . --dry-run`

## Architecture (big picture)
### Core data model
- `parseAgentsMd()` (`packages/core/src/parser.ts`) parses markdown into `ParsedAgentsMd` (`packages/core/src/types.ts`):
  - section tree (headings)
  - extracted commands (from backticks / code blocks)
  - optional YAML frontmatter + directives

### Main pipelines (in `@agentmd/core`)
- Parse + command extraction: `parser.ts` + `commands.ts`
- Validation + scoring: `validator.ts` (calls `executor.isCommandSafe()` for command safety)
- Discovery: `discovery.ts` finds all AGENTS.md and supports “nearest file wins” resolution (`findNearestAgentsMd()`)
- Composition: `compose.ts` builds AGENTS.md from fragments (`**/agents-md/**/*.md`, `**/*.agents.md`)
  - optional config: `agentmd.config.json|js|cjs`
- Execution: `executor.ts` plans + runs commands with safety patterns and optional permissions/policy
  - commands with pipes/redirection require `--use-shell`
- CI export: `ci-export.ts` converts parsed commands into GitHub Actions workflow YAML

### CLI wiring
- `packages/cli/src/cli.ts` maps subcommands (init/doctor/check/compose/run/score/export) onto core functions.

## PR conventions
- Title format: `[package] Brief description` (e.g. `[core] Add command extraction for npm scripts`)
- Keep this file under ~150 lines (the validator warns when it gets long).
