# AgentMD Production Infrastructure

Enterprise-grade architecture for the AgentMD platform.

## 1. Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Cloudflare (DDoS, CDN)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────┐           ┌─────────────────┐           ┌─────────────────┐
│   Vercel      │           │ Railway / Render │           │  status.agentmd  │
│   Next.js     │           │   API Workers    │           │  (Uptime)        │
│   (Frontend)  │           │   Auto-scaling   │           │                  │
└───────────────┘           └────────┬────────┘           └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Neon (PostgreSQL)                                          │
│                    Connection pooling (PgBouncer)                            │
│                    Read replicas for analytics                              │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ├──────────────────────────────────────────────────────────────────────
        │
        ▼                            ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│ Upstash Redis     │       │ AWS S3 / R2        │       │ Sentry             │
│ (Job queue)       │       │ (Execution logs)   │       │ (Error tracking)   │
└───────────────────┘       └───────────────────┘       └───────────────────┘
        │
        ▼
┌───────────────────┐       ┌───────────────────┐
│ Prometheus        │       │ Grafana           │
│ (Metrics)         │       │ (Dashboards)       │
└───────────────────┘       └───────────────────┘
```

### Component Summary

| Component | Provider | Purpose |
|-----------|----------|---------|
| Frontend | Vercel | Next.js dashboard, global CDN, edge functions |
| API | Railway / Render | Execution API, job workers, auto-scaling |
| Database | Neon | PostgreSQL + connection pooling |
| Queue | Upstash Redis | BullMQ job queue, rate limiting |
| Storage | AWS S3 / R2 | Execution logs, artifacts |
| Monitoring | Sentry | Error tracking, performance |
| Metrics | Prometheus + Grafana | Custom metrics, dashboards |

---

## 2. CI/CD Pipeline

### GitHub Actions Workflows

- **`ci.yml`** — Lint, test, build on every PR
- **`validate-agents-md.yml`** — AGENTS.md validation (uses AgentMD itself!)
- **`deploy-staging.yml`** — Deploy to staging on merge to `main`
- **`deploy-production.yml`** — Deploy to production (manual or tag)
- **`smoke-tests.yml`** — Post-deployment smoke tests
- **`canary.yml`** — Canary deployments (optional)

### Deployment Flow

1. PR → CI runs (lint, test, build)
2. Merge to `main` → Deploy to staging
3. Smoke tests run against staging
4. Manual approval → Deploy to production
5. Smoke tests run against production

### Database Migrations

- Migrations in `deploy/migrations/`
- Run via `npm run migrate` before deploy
- Rollback support via `npm run migrate:rollback`

---

## 3. Scaling Considerations

| Concern | Solution |
|---------|----------|
| Execution workers | Horizontal scaling (Railway/Render auto-scale) |
| Analytics queries | Read replicas (Neon read-only endpoints) |
| AGENTS.md caching | Redis cache for parsed files (TTL 5 min) |
| Rate limiting | Per API key + per IP (Upstash Redis) |
| Queue depth | Auto-scale workers based on queue depth |

### Caching Strategy

- **AGENTS.md files**: Cache parsed result in Redis, key: `agentsmd:parsed:{repo}:{sha}`
- **Marketplace agents**: Cache list for 60s
- **Execution logs**: S3/R2, no cache (read-through)

---

## 4. Security Hardening

| Control | Implementation |
|---------|----------------|
| Secrets | HashiCorp Vault (or provider secrets: Vercel, Railway) |
| Dependencies | Dependabot + `npm audit` in CI |
| Pentesting | Pre-launch penetration test |
| DDoS | Cloudflare in front of all services |
| Encryption | TLS in transit; AES-256 at rest (S3, DB) |

### Secret Management

- **Development**: `.env.local` (gitignored)
- **Staging/Production**: Vercel env vars, Railway env vars, or Vault
- **Never** commit secrets; use `deploy/.env.example` as template

---

## 5. Environment Variables

See `deploy/.env.example` for the full list. Key variables:

- `DATABASE_URL` — PostgreSQL (with pooling for serverless)
- `REDIS_URL` — Upstash Redis
- `S3_BUCKET` / `R2_*` — Object storage for logs
- `SENTRY_DSN` — Error tracking
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — Auth

Validation commands:

- `pnpm run launch:env:staging`
- `pnpm run launch:env:prod`

Secrets mapping reference:

- `docs/PRODUCTION_SECRETS.md`

---

## 6. Launch Checklist

See [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) for the full pre-launch and launch plan.
