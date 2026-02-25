# Real Execution Design

The worker currently simulates execution with fixed step durations and outputs. This document outlines the path to **real execution**—actually running commands from AGENTS.md in a sandboxed environment.

## Current State

- Worker (`deploy/worker/worker.mjs`) processes jobs from `execution_jobs`
- Executions are created with default steps (pnpm install, build, test, lint)
- Worker updates step status with hardcoded outputs; no real command execution
- `@agentmd/core` has `executeCommand` / `executeCommands` that spawn real processes

## Target State

1. Worker fetches AGENTS.md from `agentsMdUrl` (stored in execution `result`)
2. Worker parses AGENTS.md with `@agentmd/core` (parseAgentsMd, extractCommands)
3. Worker creates execution steps from extracted commands
4. Worker runs each command in a temp directory using `executeCommands`
5. Worker persists real stdout, stderr, exit codes, and duration to DB

## Implementation Phases

### Phase 1: Public Repo Execution (MVP)

**Scope**: Support public GitHub repos only. No auth, no private repo access.

1. Add `@agentmd/core` to worker dependencies
2. Worker reads `result.agentsMdUrl` from execution
3. Fetch raw AGENTS.md: `https://raw.githubusercontent.com/owner/repo/ref/path/AGENTS.md`
4. Parse and extract commands
5. Create temp dir: `mkdtempSync(join(tmpdir(), 'agentmd-'))`
6. Clone repo (shallow): `git clone --depth 1 <repo_url> <temp_dir>`
7. Run `executeCommands` with `cwd: tempDir`
8. Update `execution_steps` with real results
9. Clean up temp dir

**Env**: `AGENTMD_REAL_EXECUTION=1` to enable. Default: off (mock) for backward compatibility.

### Phase 2: Private Repo Support

- GitHub App token or PAT for private repo access
- Clone with auth: `git clone https://x-access-token:${token}@github.com/owner/repo`
- Token from execution context or repo-linked credential

### Phase 3: Sandbox Hardening

- Container-based execution (Docker, runc) for isolation
- Resource limits (CPU, memory)
- Network restrictions
- Read-only filesystem where possible

### Phase 4: Execution Modes

- **Local** — Run on worker host (Phase 1–2)
- **Container** — Run in ephemeral container (Phase 3)
- **Remote** — Delegate to external runner (e.g. GitHub Actions, self-hosted runner)

## Security Considerations

- Never execute user-provided commands without `isCommandSafe` and `isCommandAllowed` checks
- Temp dirs must be unique and cleaned up (even on failure)
- Timeout per command (default 60s) and per execution (e.g. 10 min total)
- No secrets in logs; redact tokens and credentials from stdout/stderr

## Database Changes

- `execution_steps` already has `output`, `error`, `duration_ms`, `status`
- May need `exit_code` column if not stored in `output`
- Consider `execution_mode` enum: `mock` | `real` for analytics

## Rollout

1. ~~Implement Phase 1 behind `AGENTMD_REAL_EXECUTION=1`~~ ✅ Implemented
2. Test with public repos (e.g. agentmd/agentmd)
3. Add feature flag in dashboard to toggle real vs mock per execution
4. Document in PROVISION.md and worker README

## Implementation (Phase 1)

- **Worker** (`deploy/worker/worker.mjs`): When `AGENTMD_REAL_EXECUTION=1`, fetches AGENTS.md from `result.agentsMdUrl`, parses with `@agentmd/core`, derives repo URL from raw GitHub URL, clones repo, runs `executeCommands`, persists real results. Falls back to mock on failure or non-GitHub URLs.
- **Dependencies**: Worker uses `@agentmd/core` (workspace). Build core before running worker: `pnpm run build` in `packages/core`.
