# AgentMD Launch Checklist

Last updated: 2026-02-21

This checklist separates repo-complete work from cloud/account execution.

**Provisioning guide**: See [deploy/provision/PROVISION.md](../deploy/provision/PROVISION.md) for step-by-step setup of Vercel, Postgres, Redis, S3, and GitHub. **Neon**: [docs/NEON.md](NEON.md).

## 1) Repo-Complete (Done in codebase)

- [x] Production deploy workflows fail fast on missing env/secrets.
- [x] Production env validator script exists (`pnpm run launch:env:prod`).
- [x] Staging env validator script exists (`pnpm run launch:env:staging`).
- [x] DB migrations are wired in CI/CD and production deploy workflow.
- [x] Ops APIs are authenticated and user-scoped.
- [x] `/api/health/ready` fails if DB is required but missing.
- [x] Dependabot is enabled (`.github/dependabot.yml`).
- [x] Deployment env templates include OAuth, GitHub App, Stripe, Slack, Sentry, Redis, S3.

## 2) Infrastructure Provisioning

**Option A: Terraform** (recommended) — `deploy/terraform/` provisions Neon, Upstash, S3. See [deploy/terraform/README.md](../deploy/terraform/README.md).

**Option B: Manual** — Cloud console actions:

- [ ] Vercel project configured for `apps/dashboard` with production domain.
- [ ] Managed Postgres (Neon) provisioned with pooling URL.
- [ ] Managed Redis (Upstash) provisioned for queue/rate limiting.
- [ ] Object storage (S3 or R2) bucket created for execution logs.
- [ ] Worker runtime deployed (Railway/Render) with production env vars.
- [ ] Sentry project + DSN created and wired to deployment env.
- [ ] status.agentmd.com uptime monitors configured.

Acceptance criteria:
- [ ] `GET /api/health` returns 200 in production.
- [ ] `GET /api/health/ready` returns 200 in production.
- [ ] Migrations run successfully against production DB.
- [ ] First queued execution progresses `pending -> running -> success`.

## 3) Secrets & Provider Configuration (Cloud/provider actions)

- [ ] GitHub OAuth app configured with production callback URL.
- [ ] GitHub App configured (install/callback/webhook) with signing secret.
- [ ] Stripe live keys and price IDs configured.
- [ ] Slack webhook configured for production alerts.
- [ ] Sentry DSN configured (server + client where needed).
- [ ] All production secrets stored in provider secret managers (not `.env` files).

Required production secrets (minimum):
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXTAUTH_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `GITHUB_ID`
- [ ] `GITHUB_SECRET`
- [ ] `GITHUB_WEBHOOK_SECRET`
- [ ] `DATABASE_URL`
- [ ] `REDIS_URL`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PRO_PRICE_ID`
- [ ] `STRIPE_ENTERPRISE_PRICE_ID`
- [ ] `SENTRY_DSN`
- [ ] `SLACK_WEBHOOK_URL`
- [ ] `S3_BUCKET`
- [ ] `S3_REGION`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`

## 4) Security & Compliance Execution

- [ ] Cloudflare protection enabled for all public endpoints.
- [ ] Penetration test completed and findings triaged.
- [ ] SOC2 Type II process started or active badge available.
- [ ] Privacy policy and terms are published on production domain.
- [ ] GDPR statement is published on production domain.
- [ ] Incident response contact and escalation policy documented.

## 5) GTM Execution

- [ ] Product Hunt launch assets finalized (tagline/screenshots/demo).
- [ ] Show HN post drafted and reviewed by engineering.
- [ ] Press kit finalized (logo/screenshots/founder quote/fact sheet).
- [ ] Community plan scheduled (Discord, Reddit, X thread).
- [ ] Launch-day owner rota assigned (comments/support/on-call).

## 6) Command Runbook

Run before production deploy:

```bash
pnpm run lint
pnpm run test
pnpm run build
pnpm run launch:env:prod
pnpm run migrate
pnpm run launch:mvp:check -- --target=production --app-url="$NEXT_PUBLIC_APP_URL"
```

After deploy:

```bash
curl -fsS "$NEXT_PUBLIC_APP_URL/api/health"
curl -fsS "$NEXT_PUBLIC_APP_URL/api/health/ready"
```

GitHub required checks automation:

```bash
GITHUB_TOKEN=... pnpm run github:protect:branch -- --repos=ORG/REPO --branch=main
```
