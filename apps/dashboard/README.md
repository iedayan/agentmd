# AgentMD Dashboard

Next.js 14 dashboard for the AgentMD platform — GitHub Actions for agent instructions.

## Features

- **Repository Dashboard** — Connected repos, AGENTS.md health scores, validation status
- **Execution History** — Runs by push, PR, schedule, manual with logs
- **Execution Timeline** — Step-by-step view with pass/fail, duration, output
- **Cost Tracking** — Execution minutes, monthly usage
- **Dark Mode** — Full theme support
- **Stripe Billing** — Pro ($49/mo) subscription with feature gating

## Plans

|                    | Free   | Pro ($49/mo)  |
| ------------------ | ------ | ------------- |
| Repositories       | 3      | Unlimited     |
| Execution min/mo   | 100    | 1000          |
| Log retention      | 7 days | 30 days       |
| Parallel execution | No     | Yes           |
| Team seats         | 1      | 5             |
| Notifications      | —      | Slack/Discord |

## Setup

```bash
# From monorepo root
pnpm install
pnpm run build:core

# Dashboard
pnpm --filter @agentmd/dashboard run dev
```

Open http://localhost:3001

## Environment Variables

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

See `apps/dashboard/.env.example` for a copyable template.

## Deployment

### Vercel (recommended)

1. Import the repo in Vercel.
2. Set **Root Directory** to `apps/dashboard`.
3. Use **Install Command**: `pnpm install --frozen-lockfile`
4. Use **Build Command**: `pnpm --filter @agentmd/dashboard run build`
5. Set required env vars from `.env.example`.

Why Vercel here: this app uses Next.js App Router APIs, and Vercel provides the most predictable runtime behavior and performance for Next.js workloads.

### Netlify (works, but second choice)

Netlify can host this app, but advanced Next.js behavior and server runtime parity are typically smoother on Vercel. If you choose Netlify, use the same env vars and ensure the Next.js runtime/plugin is configured for App Router server functions.

## Troubleshooting

**`TypeError: Cannot read properties of undefined (reading 'call')`**

This webpack error often appears in production or after cache issues. Try:

1. Build core first: `pnpm run build:core`
2. Clear Next.js cache: `rm -rf apps/dashboard/.next`
3. Rebuild: `pnpm run build:dashboard`

If it persists, ensure `transpilePackages` is not used for `@agentmd/core` in `next.config.js` (use the pre-built dist instead).

## API Routes

- `GET /api/repositories` — List connected repos
- `GET /api/executions` — Execution history
- `GET /api/executions/[id]` — Execution detail with steps
- `POST /api/jobs` — Create manual execution job
- `POST /api/stripe/checkout` — Create Stripe checkout session
