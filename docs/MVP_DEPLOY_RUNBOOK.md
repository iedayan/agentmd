# AgentMD MVP Deploy Runbook

Step-by-step deployment for MVP launch. Run in order.

## Prerequisites

- [ ] GitHub repo with latest code
- [ ] Access to Vercel, Neon, Upstash (or Terraform outputs)
- [ ] GitHub OAuth app configured
- [ ] Stripe account (optional for soft launch)

## 1. Provision Infrastructure

**Option A: Terraform** (recommended)

```bash
cd deploy/terraform
terraform init
terraform plan
terraform apply
pnpm run terraform:output  # Copy outputs to .env
```

**Option B: Manual** — Follow [deploy/provision/PROVISION.md](../deploy/provision/PROVISION.md)

## 2. Set Environment Variables

Create `.env.production` (or use Vercel env UI) with:

```bash
# Required (soft launch)
NEXT_PUBLIC_APP_URL=https://agentmd.online
NEXTAUTH_URL=https://agentmd.online
NEXTAUTH_SECRET=<openssl rand -base64 32>
GITHUB_ID=<GitHub OAuth Client ID>
GITHUB_SECRET=<GitHub OAuth Client Secret>
DATABASE_URL=<Neon Postgres URL>

# Optional for soft launch
REDIS_URL=<Upstash Redis URL>
GITHUB_WEBHOOK_SECRET=<...>
STRIPE_SECRET_KEY=<...>
STRIPE_PRO_PRICE_ID=<...>
SENTRY_DSN=<...>
SLACK_WEBHOOK_URL=<...>
```

## 3. Run Migrations

```bash
DATABASE_URL="postgresql://..." pnpm run migrate
```

## 4. Validate Environment

```bash
pnpm run launch:env:prod --soft-launch   # Soft launch (core only)
# or
pnpm run launch:env:prod                 # Full production
```

## 5. Deploy Dashboard (Vercel)

```bash
# Via Vercel CLI or GitHub integration
vercel --prod
# Or push to main if CI/CD is configured
```

## 6. Deploy Worker (Railway/Render)

Worker processes execution jobs. Required for `pending → running → success` flow.

**Railway**:
1. New project → Deploy from GitHub
2. Root directory: repo root (or `deploy/worker`)
3. Start command: `node deploy/worker/worker.mjs`
4. Add env vars: `DATABASE_URL`, `WORKER_ID` (optional)

**Render**:
1. New → Background Worker
2. Build: `pnpm install`
3. Start: `node deploy/worker/worker.mjs`
4. Add env vars

## 7. Post-Deploy Verification

```bash
# Health checks
curl -fsS https://your-domain.com/api/health
curl -fsS https://your-domain.com/api/health/ready

# Full MVP check (requires app to be live)
NEXT_PUBLIC_APP_URL=https://your-domain.com pnpm run launch:mvp:check -- --target=production --app-url=https://your-domain.com
```

## 8. Configure DNS & Domain

- Add custom domain in Vercel
- Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL`
- Redeploy if needed

## 9. Legal Pages

Ensure these are live and linked from footer:
- [ ] /privacy — Privacy Policy
- [ ] /terms — Terms of Service
- [ ] /gdpr — GDPR Statement

## 10. Launch-Day Checklist

- [ ] On-call owner assigned
- [ ] Status page / uptime monitor configured
- [ ] Incident response contact documented ([docs/INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md))
- [ ] Product Hunt / Show HN assets ready ([docs/GTM/LAUNCH_ASSETS.md](GTM/LAUNCH_ASSETS.md))

## Rollback

1. Vercel → Deployments → Promote previous deployment
2. Worker: Redeploy previous version if needed
3. Database: Migrations are forward-only; coordinate before rollback
