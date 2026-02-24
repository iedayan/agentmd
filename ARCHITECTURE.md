AgentMD Architecture

Overview
- A PNPM monorepo hosting core parsing/validation logic, a dashboard UI, a CLI, and a dashboard app.
- Packages:
  - @agentmd/core: Core parsing, validation, discovery, composition, and execution logic for AGENTS.md.
  - @agentmd/cli: Command-line interface to interact with AgentMD features.
  - @agentmd/sdk: Client SDK exposing core capabilities for external tools.
  - @agentmd/dashboard: Next.js dashboard UI for visibility into agent health and runs.
  - apps/dashboard: The Next.js app source within the monorepo structure.

Data flow (high level)
- AGENTS.md input is parsed by core, producing a ParsedAgentsMd structure.
- Validation checks are performed (validator.ts) to produce errors/warnings/suggestions.
- Discovery/Frontmatter/Directives flows produce fragments/compose results.
- Commands are planned/executed by executor.ts, and optional output contracts are exported to CI workflows via ci-export.ts.
- The dashboard UI consumes core data (via sdk) to display health scores, run history, and health metrics.

Key build and test signals
- Build: pnpm -r run build
- Tests: pnpm -r run test (Vitest-based)
- Lint/Format: ESLint/Prettier baseline in place for consistency

Notes
- This file is a high-level guide; for contributor onboarding see CONTRIBUTING.md and CODE_OF_CONDUCT.md.
