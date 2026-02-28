# AgentMD Dashboard Deployment

## Prerequisites

- Node.js >= 20
- PostgreSQL (Neon or self-hosted)
- GitHub OAuth App
- (Optional) GitHub App for repo connection
- (Optional) Stripe for billing

**Full provisioning guide**: See [deploy/provision/PROVISION.md](../../deploy/provision/PROVISION.md) for step-by-step setup.

## Environment Variables

Copy `apps/dashboard/.env.example` to `.env.local` and fill in:

| Variable                  | Required   | Description                                                    |
| ------------------------- | ---------- | -------------------------------------------------------------- |
| `NEXTAUTH_SECRET`         | Yes        | 32+ char secret (`openssl rand -base64 32`)                    |
| `GITHUB_ID`               | Yes        | GitHub OAuth App Client ID                                     |
| `GITHUB_SECRET`           | Yes        | GitHub OAuth App Client Secret                                 |
| `NEXT_PUBLIC_APP_URL`     | Yes        | Public URL (e.g. `https://agentmd.example.com`)                |
| `NEXTAUTH_URL`            | Prod       | Same as `NEXT_PUBLIC_APP_URL` in production                    |
| `DATABASE_URL`            | Yes (Prod) | Postgres connection string (required in production)            |
| `AGENTMD_ALLOW_IN_MEMORY` | Optional   | Set to `true` only for non-production/demo fallback without DB |
| `GITHUB_APP_SLUG`         | Optional   | GitHub App slug for "Connect with GitHub"                      |
| `GITHUB_WEBHOOK_SECRET`   | Optional   | For webhook signature verification                             |
| `STRIPE_*`                | Optional   | For Pro/Enterprise billing                                     |

## Database Setup

1. Create a Postgres database (Neon, etc.).
2. Run migrations:
   ```bash
   DATABASE_URL=postgresql://... pnpm run migrate
   ```
3. Set `DATABASE_URL` in your environment.

## GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps.
2. Create a new OAuth App.
3. Set **Authorization callback URL** to `{NEXT_PUBLIC_APP_URL}/api/auth/callback/github`.
4. Copy Client ID and Secret to `GITHUB_ID` and `GITHUB_SECRET`.

## GitHub App (Optional)

For "Connect with GitHub" and webhooks:

1. Create a [GitHub App](https://github.com/settings/apps/new).
2. Set **Webhook URL** to `{NEXT_PUBLIC_APP_URL}/api/github/webhooks`.
3. Set **Callback URL** to `{NEXT_PUBLIC_APP_URL}/api/github/callback`.
4. Subscribe to: `check_run`, `check_suite`, `pull_request`.
5. Set `GITHUB_APP_SLUG` to your app slug (from the app URL).
6. Generate a webhook secret and set `GITHUB_WEBHOOK_SECRET`.
7. For "Sync from GitHub": set `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` (PEM, from App settings → Private keys).

## Vercel

1. Import the repo and set root to the monorepo.
2. Set **Build Command**: `pnpm run build:dashboard` (or `cd apps/dashboard && pnpm run build`).
3. Set **Output Directory**: `apps/dashboard/.next`.
4. Add all environment variables.
5. For Postgres, use Vercel Postgres or connect an external DB.

## Health Check

- `GET /api/health` — Basic liveness
- `GET /api/health/ready` — Readiness (persistence + DB when configured)

## Execution Lifecycle

The dashboard queues executions via `POST /api/execute`. In the current implementation:

- **In-memory mode**: Executions run a simulated lifecycle (pending → running → success) for demo.
- **Database mode**: Executions are persisted and progress through a built-in lifecycle (`pending → running → success`) for baseline operability. For durable/background execution, wire a real worker.

For production-grade agent execution, integrate with:

- A job queue (e.g. BullMQ, Inngest) that processes queued executions
- GitHub Actions or CI to run `agentmd run` on push/PR
- Webhook handlers that update execution status when runs complete
