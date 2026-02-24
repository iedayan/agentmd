# Production Secrets Matrix

This file maps each launch secret to provider setup.

## Core Platform

| Secret | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Vercel project settings | Public HTTPS origin |
| `NEXTAUTH_URL` | Vercel project settings | Usually same as `NEXT_PUBLIC_APP_URL` |
| `NEXTAUTH_SECRET` | Generated (`openssl rand -base64 32`) | 32+ chars |
| `DATABASE_URL` | Neon | Use pooled URL when possible |
| `REDIS_URL` | Upstash | Prefer TLS endpoint |

## GitHub Integrations

| Secret | Source | Notes |
|---|---|---|
| `GITHUB_ID` | GitHub OAuth App | Client ID |
| `GITHUB_SECRET` | GitHub OAuth App | Client secret |
| `GITHUB_APP_ID` | GitHub App | Numeric app id |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App | PEM key (single-line escaped) |
| `GITHUB_APP_SLUG` | GitHub App | App slug |
| `GITHUB_WEBHOOK_SECRET` | GitHub App | Webhook signature secret |

## Billing

| Secret | Source | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe | Live secret key |
| `STRIPE_PRO_PRICE_ID` | Stripe | Pro plan price id |
| `STRIPE_ENTERPRISE_PRICE_ID` | Stripe | Enterprise plan price id |

## Monitoring and Alerts

| Secret | Source | Notes |
|---|---|---|
| `SENTRY_DSN` | Sentry project settings | Backend DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project settings | Optional browser DSN |
| `SLACK_WEBHOOK_URL` | Slack app incoming webhook | Alert notifications |
| `AGENTMD_EVENTS_WEBHOOK_URL` | Internal webhook receiver | Receives `contract.failed`, `quality_gate.failed`, `artifacts.missing`, `exit_criteria.unmet` events |

## Object Storage

| Secret | Source | Notes |
|---|---|---|
| `S3_BUCKET` | AWS S3 / Cloudflare R2 | Log/artifact bucket |
| `S3_REGION` | AWS | Region code |
| `AWS_ACCESS_KEY_ID` | AWS IAM user/role | Least privilege only |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user/role | Rotate regularly |

## Verification

Run:

```bash
pnpm run launch:env:prod
```

CI workflows `Deploy Production` and `Migrate` also enforce this contract.
