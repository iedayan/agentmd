# Vercel Environment Variables

Copy these into your Vercel project: **Settings → Environment Variables**.

## Required for soft launch

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://agentmd.online` | Production, Preview |
| `NEXTAUTH_URL` | `https://agentmd.online` | Production, Preview |
| `NEXTAUTH_SECRET` | *(see below)* | Production, Preview |
| `GITHUB_ID` | From [GitHub OAuth App](https://github.com/settings/developers) | Production, Preview |
| `GITHUB_SECRET` | From GitHub OAuth App | Production, Preview |
| `DATABASE_URL` | From [Neon](https://neon.tech) (pooled connection string) | Production, Preview |

## Optional (full launch)

| Name | Value | Environment |
|------|-------|-------------|
| `REDIS_URL` | From [Upstash](https://upstash.com) | Production |
| `GITHUB_APP_ID` | From GitHub App settings | Production |
| `GITHUB_APP_PRIVATE_KEY` | PEM key (single-line, escape `\n`) | Production |
| `GITHUB_APP_SLUG` | App slug from `github.com/apps/your-slug` | Production |
| `GITHUB_WEBHOOK_SECRET` | *(see below)* | Production |
| `STRIPE_SECRET_KEY` | From [Stripe Dashboard](https://dashboard.stripe.com) | Production |
| `STRIPE_PRO_PRICE_ID` | Stripe Pro price ID | Production |
| `STRIPE_ENTERPRISE_PRICE_ID` | Stripe Enterprise price ID | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Production |
| `SENTRY_DSN` | From [Sentry](https://sentry.io) | Production |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook | Production |
| `SLACK_SIGNING_SECRET` | For Slack interactivity | Production |
| `S3_BUCKET` | S3/R2 bucket name | Production |
| `S3_REGION` | e.g. `us-east-1` or `auto` (R2) | Production |
| `AWS_ACCESS_KEY_ID` | S3/R2 access key | Production |
| `AWS_SECRET_ACCESS_KEY` | S3/R2 secret key | Production |
| `JIRA_WEBHOOK_URL` | Jira webhook for execution status | Production |
| `RESEND_API_KEY` | From [Resend](https://resend.com) — for contact form emails to iedayan03@gmail.com | Production |

## Generated secrets

Run these locally and paste the output into Vercel:

```bash
# NEXTAUTH_SECRET (required)
openssl rand -base64 32

# GITHUB_WEBHOOK_SECRET (when using GitHub App)
openssl rand -hex 32
```

## Bulk import format

For Vercel CLI or bulk paste, use this format (replace placeholders). Production domain: `https://agentmd.online`.

```
NEXT_PUBLIC_APP_URL=https://agentmd.online
NEXTAUTH_URL=https://agentmd.online
NEXTAUTH_SECRET=<paste output of: openssl rand -base64 32>
GITHUB_ID=<from GitHub OAuth App>
GITHUB_SECRET=<from GitHub OAuth App>
DATABASE_URL=<from Neon - use pooled URL>
```

## After deploy

1. For production, use `https://agentmd.online` as `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL`.
2. Update GitHub OAuth callback URL to `https://agentmd.online/api/auth/callback/github`.
3. If using GitHub App, set webhook URL to `https://agentmd.online/api/github/webhooks`.
