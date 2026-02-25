# AgentMD Worker

Background worker that processes execution jobs from the queue. Polls `execution_jobs`, runs executions, and updates `execution_steps` and `executions`.

## Requirements

- Node.js 20+
- Postgres (connection via `DATABASE_URL`)
- Git (for real execution: clone repos)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `AGENTMD_REAL_EXECUTION` | No | Set to `1` to run real commands from AGENTS.md. When enabled, fetches AGENTS.md from `agentsMdUrl`, parses commands, clones the repo, and executes. Falls back to mock when disabled or when URL is not a GitHub repo. |
| `WORKER_ID` | No | Identifier for this worker (default: `worker-${pid}`) |
| `WORKER_POLL_INTERVAL_MS` | No | Poll interval in ms (default: 1000) |
| `WORKER_RETRY_BACKOFF_SECONDS` | No | Seconds to wait before retry on failure (default: 30) |
| `JIRA_WEBHOOK_URL` | No | Webhook URL for Jira notifications on execution completion |

## Build & Run

From the monorepo root:

```bash
# Install dependencies (includes @agentmd/core for real execution)
pnpm install

# Build core package (required for real execution)
pnpm run build:core

# Run worker
DATABASE_URL="postgresql://..." node deploy/worker/worker.mjs
```

With real execution:

```bash
DATABASE_URL="postgresql://..." AGENTMD_REAL_EXECUTION=1 node deploy/worker/worker.mjs
```

## Deployment

### Railway

1. New project → Add service from GitHub.
2. **Start command**: `node deploy/worker/worker.mjs`
3. **Build**: `pnpm install && pnpm run build:core`
4. Add `DATABASE_URL` and optionally `AGENTMD_REAL_EXECUTION=1`.

### Render

1. New → Background Worker.
2. **Build command**: `pnpm install && pnpm run build:core`
3. **Start command**: `node deploy/worker/worker.mjs`
4. Add environment variables.

## Execution Modes

- **Mock** (default): Simulates execution with fixed step durations and outputs. No repo access.
- **Real** (`AGENTMD_REAL_EXECUTION=1`): Fetches AGENTS.md from GitHub, parses commands, clones repo, runs `executeCommands` from `@agentmd/core`. Only supports public GitHub repos (raw or blob URLs). Marketplace or non-GitHub URLs fall back to mock.
