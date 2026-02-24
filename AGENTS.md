# AgentMD

AgentMD is the CI/CD platform for AI agents — we parse, validate, and execute AGENTS.md files.

## Development setup

- Use `pnpm` for package management. Run `pnpm install` from the repo root.
- This is a pnpm workspace. Packages live in `packages/`, apps in `apps/`.
- Use `pnpm --filter <package-name>` to run commands in specific packages.

## Build and test commands

- **Build**: `pnpm run build` from root builds all packages.
- **Test**: `pnpm run test` runs the test suite across packages.
- **Lint**: `pnpm run lint` runs ESLint.
- **CLI**: After building, run `pnpm agentmd <command>` or `pnpm --filter @agentmd/cli exec agentmd <command>`.

## Testing instructions

- Tests use Vitest. Run `pnpm test` in each package or from root.
- Core parser tests are in `packages/core/src/__tests__/`.
- Add tests for new parsing rules or validation logic.
- Run `pnpm run build` before committing to ensure TypeScript compiles.

## PR instructions

- Title format: `[package] Brief description` (e.g., `[core] Add command extraction for npm scripts`)
- Run `pnpm run lint` and `pnpm run test` before committing.
- Keep AGENTS.md under 150 lines per the standard.
