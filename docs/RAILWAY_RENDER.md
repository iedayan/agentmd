# Railway / Render Deployment

AgentMD API and workers can run on Railway or Render for auto-scaling.

## Railway

1. Create a new project
2. Add services:
   - **Dashboard** (optional if using Vercel): Connect GitHub, set root to `apps/dashboard`
   - **Worker**: Use `deploy/Dockerfile.worker`, set `REDIS_URL` and `DATABASE_URL`
3. Add Redis (Upstash) and PostgreSQL (Neon) as env vars
4. Enable auto-scaling based on CPU/memory or queue depth

## Render

1. Create Web Service for dashboard (or use Vercel)
2. Create Background Worker from `deploy/Dockerfile.worker`
3. Add environment variables from `deploy/.env.example`
4. Configure auto-scaling in Render dashboard

## Worker Environment

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
S3_BUCKET=agentmd-logs
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SENTRY_DSN=https://...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
AGENTMD_LICENSE_KEY=  # Enterprise only
```

## Preflight Before Cutover

Run locally or in CI with production secret values:

```bash
pnpm run launch:env:prod
pnpm run migrate
```

## Scaling

- **Horizontal**: Increase worker replica count
- **Queue-based**: Use Upstash Redis queue depth to trigger scaling (Render/Railway support)
- **Rate limiting**: Implement in worker using Upstash Redis
