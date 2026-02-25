# Cloudflare Setup for AgentMD

Optional: Put AgentMD behind Cloudflare for DDoS protection, rate limiting, and WAF.

## Quick Setup

1. Add your domain to Cloudflare (DNS).
2. Create a Cloudflare proxy (orange cloud) for your app subdomain (e.g. `app.agentmd.io`).
3. Point the CNAME to your Vercel deployment (e.g. `cname.vercel-dns.com`).

## Recommended Settings

- **SSL/TLS**: Full (strict) — Cloudflare terminates SSL, forwards to origin
- **Security Level**: Medium (or High for production)
- **Bot Fight Mode**: On (optional)
- **Under Attack Mode**: Off for normal operation; enable during severe DDoS

## WAF Rules (Optional)

Create a custom rule to block common attack patterns:

- Block requests with `User-Agent` containing known bad bots
- Challenge requests from countries you don't serve (if applicable)
- Rate limit `/api/*` by IP (e.g. 100 req/min per IP)

## Rate Limiting

Cloudflare rate limiting can complement application-level limits. Consider:

- 1000 requests per minute per IP for general traffic
- 100 requests per minute per IP for `/api/*`

## Caching

- **Cache static assets**: `/_next/static/*`, `/icon.svg` — Cache for 1 year
- **Cache API**: None — All `/api/*` should bypass cache (already set via `Cache-Control: no-store` in Next.js)

## Health Checks

Ensure Cloudflare doesn't cache or block:

- `GET /api/health`
- `GET /api/health/ready`

These should always reach your origin for uptime monitoring.
