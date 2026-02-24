# Neon Integration

AgentMD uses [Neon](https://neon.tech) for serverless Postgres. The dashboard uses `@neondatabase/serverless` for optimal Vercel deployment.

## Connection string

1. Create a project at [console.neon.tech](https://console.neon.tech)
2. Go to **Connect** → **Connection string**
3. Select **Pooled** (required for serverless)
4. Copy the connection string and set as `DATABASE_URL`

Format: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

## Driver

- **Dashboard** (Vercel): `@neondatabase/serverless` — HTTP/WebSocket, tuned for serverless
- **Worker** (Railway/Render): `pg` (node-postgres) — long-running process; use Neon pooled connection string

## Pool config

The dashboard uses a small pool (`max: 2`) for serverless to avoid exhausting connections. Each Vercel function instance gets its own pool.

## Terraform

Neon is provisioned via Terraform in `deploy/terraform/neon.tf`. After `terraform apply`, get `DATABASE_URL` from the [Neon Console](https://console.neon.tech) (Terraform outputs the project ID).
