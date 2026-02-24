# AgentMD Launch Provisioning Guide

Step-by-step instructions to provision infrastructure for a soft launch or full production deploy.

## Quick start: Terraform (recommended)

For automated provisioning, use Terraform:

```bash
# Set provider credentials (see deploy/terraform/README.md)
export NEON_API_KEY="..."
export UPSTASH_EMAIL="..." UPSTASH_API_KEY="..."
export AWS_ACCESS_KEY_ID="..." AWS_SECRET_ACCESS_KEY="..."

cd deploy/terraform
terraform init
terraform plan
terraform apply
```

Then copy outputs to your env (see `pnpm run terraform:output`). Full details: [deploy/terraform/README.md](../terraform/README.md).

---

## Manual provisioning

| Service | Purpose | Soft Launch | Full Launch |
|---------|---------|--------------|-------------|
| Vercel | Dashboard hosting | Required | Required |
| Postgres (Neon) | User data, executions | Required | Required |
| Redis (Upstash) | Rate limiting, queue | Optional | Required |
| S3/R2 | Execution logs | Optional | Required |
| Worker | Background jobs | Optional | Required |
| Sentry | Error tracking | Optional | Required |
| Slack | Alerts | Optional | Required |

---

## 1. Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **New Project** → Import your `agentmd/agentmd` repo.
3. **Configure Project**:
   - **Root Directory**: `apps/dashboard`
   - **Framework Preset**: Next.js
   - **Build Command**: `cd ../.. && pnpm run build:dashboard`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`
4. Add environment variables (see Section 7).
5. Deploy. Note your **Project ID** and **Org ID** (Settings → General).
6. Create a [Vercel token](https://vercel.com/account/tokens) for CI. Store as `VERCEL_TOKEN`.

---

## 2. Postgres (Neon)

1. Go to [neon.tech](https://neon.tech) and create an account.
2. **New Project** → Choose region (e.g. `us-east-1`).
3. Copy the connection string (use **Pooled** for serverless).
4. Set `DATABASE_URL` in Vercel:
   ```
   postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Run migrations locally first:
   ```bash
   DATABASE_URL="postgresql://..." pnpm run migrate
   ```

---

## 3. Redis (Upstash)

1. Go to [upstash.com](https://upstash.com) and create an account.
2. **Create Database** → Redis, choose region.
3. Copy the **REST URL** or **Redis URL**.
4. Set `REDIS_URL` in Vercel:
   ```
   redis://default:xxx@xxx.upstash.io:6379
   ```
   Or `rediss://` for TLS.

---

## 4. Object Storage (Cloudflare R2 or AWS S3)

### Option A: Cloudflare R2

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2.
2. **Create bucket** (e.g. `agentmd-logs`).
3. **R2 API Tokens** → Create token with Object Read & Write.
4. Set in Vercel:
   - `S3_BUCKET` = bucket name
   - `S3_REGION` = `auto` (R2)
   - `AWS_ACCESS_KEY_ID` = R2 access key
   - `AWS_SECRET_ACCESS_KEY` = R2 secret key
   - `S3_ENDPOINT` = `https://<account-id>.r2.cloudflarestorage.com` (if using R2-compatible client)

### Option B: AWS S3

1. Create S3 bucket (e.g. `agentmd-logs`).
2. Create IAM user with `s3:PutObject`, `s3:GetObject` on the bucket.
3. Set in Vercel:
   - `S3_BUCKET` = bucket name
   - `S3_REGION` = e.g. `us-east-1`
   - `AWS_ACCESS_KEY_ID` = IAM access key
   - `AWS_SECRET_ACCESS_KEY` = IAM secret key

---

## 5. Worker (Optional for soft launch)

For background execution processing, deploy a worker:

### Railway

1. Create [Railway](https://railway.app) project.
2. Add service from GitHub repo, set root to `apps/dashboard` or a worker package.
3. Configure env vars (same as Vercel).
4. Set start command for worker process (e.g. `node worker.js`).

### Render

1. Create [Render](https://render.com) account.
2. **New** → Background Worker.
3. Connect repo, set build/start commands.
4. Add environment variables.

---

## 6. GitHub OAuth & GitHub App

See [GITHUB.md](./GITHUB.md) for detailed setup.

---

## 7. Environment Variables Summary

Copy to Vercel (and worker if applicable):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL (e.g. `https://agentmd.io`) |
| `NEXTAUTH_URL` | Yes | Same as `NEXT_PUBLIC_APP_URL` |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `GITHUB_ID` | Yes | GitHub OAuth Client ID |
| `GITHUB_SECRET` | Yes | GitHub OAuth Client Secret |
| `DATABASE_URL` | Yes | Postgres connection string |
| `REDIS_URL` | Soft: No | Redis connection string |
| `GITHUB_APP_SLUG` | Optional | GitHub App slug |
| `GITHUB_APP_ID` | Optional | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | Optional | GitHub App PEM key |
| `GITHUB_WEBHOOK_SECRET` | Optional | Webhook signing secret |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key |
| `STRIPE_PRO_PRICE_ID` | Optional | Stripe Pro price ID |
| `STRIPE_ENTERPRISE_PRICE_ID` | Optional | Stripe Enterprise price ID |
| `SENTRY_DSN` | Optional | Sentry DSN |
| `SLACK_WEBHOOK_URL` | Optional | Slack webhook for alerts |
| `S3_BUCKET` | Optional | S3/R2 bucket name |
| `S3_REGION` | Optional | S3/R2 region |
| `AWS_ACCESS_KEY_ID` | Optional | S3/R2 access key |
| `AWS_SECRET_ACCESS_KEY` | Optional | S3/R2 secret key |

---

## 8. GitHub Secrets for CI/CD

Add these to your repo (Settings → Secrets → Actions):

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- All production env vars (or use Vercel env sync)

For soft launch, use `pnpm run launch:env:prod --soft-launch` in the deploy workflow.
