# AgentMD Marketplace

Ecosystem for discovering, purchasing, and executing agents through AGENTS.md.

## Agent Marketplace

- **Directory** — Certified agents with capabilities, permissions, pricing
- **Search & Filters** — Category, price, trust score, certified only
- **Listings** — Reviews, ratings, example AGENTS.md, required permissions

## Payment (Stripe Connect)

- **Platform fee**: 15% on transactions
- **Models**: One-time, subscription, usage-based, free
- **Payouts**: Automated to connected seller accounts
- **Refunds**: Standard Stripe dispute handling

## Agent Execution API

```
POST /api/execute
  agentsMdUrl or agentId required
  x-api-key: required
  x-webhook-url: optional (completion notification)
```

## Verification Program

**Certified AGENTS.md Compatible** badge:

- Security review (no dangerous commands, permissions declared)
- Performance benchmarking
- Trust score: test coverage, reviews, security, update frequency
- Regular re-verification

## Developer Tools

- **AGENTS.md Generator** — React, Next.js, Python, Rust templates
- **Migration** — CLAUDE.md, .cursorrules, Aider, Gemini CLI
- **Testing Sandbox** — Isolate before publish
- **Seller Analytics** — Usage, revenue, performance
- **SDK** — `agentmd marketplace list`, `agentmd execute`
