# YC Application Draft - AgentMD

## Company

- **Company name:** AgentMD
- **One-liner:** CI/CD and governance platform for AI agents using `AGENTS.md`.
- **Website:** [https://agentmd.io](https://agentmd.io) (replace if different)
- **Location:** [CITY, STATE / REMOTE]
- **Incorporation:** [C-Corp / Date]

## What is AgentMD?

AgentMD makes AI-agent execution safe, auditable, and production-ready for software teams.

We parse and validate `AGENTS.md`, enforce policy-as-code and required status gates before execution, route approvals with ownership controls, and provide operational analytics (reliability, ROI, and trend dashboards).

## Problem

AI coding agents are becoming common, but most teams still run them with weak controls:

- unclear execution policy
- no mandatory preflight checks
- no ownership/approval workflow
- poor auditability and post-run analytics

This creates release risk, security risk, and compliance friction.

## Solution

AgentMD adds a control plane on top of AI-agent execution:

- required status gates (including GitHub checks)
- policy-as-code preflight enforcement
- owner/approver workflows and notifications
- SSO/RBAC/compliance artifacts
- operational runbook and outcome analytics

## Why now?

- AI agents are moving from experiments to production engineering workflows.
- Teams need controls and governance before broad rollout.
- Enterprises are now requiring approval/audit/ownership guarantees for automated code actions.

## Market

- **Initial wedge:** engineering teams adopting AI-assisted development in CI/CD.
- **Expansion:** platform/security/compliance teams standardizing agent governance org-wide.
- **Market size framing:** dev tooling + CI/CD + AI operations budgets in software orgs.

## Product status

- Working Next.js dashboard and APIs in production-style architecture.
- Real pre-execution gating logic integrated in `/api/execute`.
- Governance state persistence.
- GitHub webhook ingestion (signed), operational readiness endpoints, and Ops runbook.

## Business model

- SaaS subscription by team/organization tier.
- Potential add-ons: enterprise controls, self-hosted, advanced compliance reporting.

## Traction

- Pilot users: `[N]`
- Weekly active repos: `[N]`
- Monthly executions: `[N]`
- Paid customers / ARR: `[$N]`
- Growth (MoM): `[N%]`

## Competition

- Generic CI/CD and observability tools
- Point solutions for AI coding workflows
- Internal custom scripts

### Why we win

- Agent-specific governance, not generic automation
- Integrated preflight + approvals + ownership + analytics in one plane
- `AGENTS.md` native workflow

## Moat

- Workflow lock-in from policy definitions and governance operations
- Audit/compliance history and operational telemetry
- Integrations + execution feedback loop data over time

## What we need from YC

- Go-to-market speed on enterprise developer tooling
- hiring and sales motion guidance for platform/security buyers
- network for design partners in larger engineering orgs

## Fundraising ask

- Raising: `$[N]` pre-seed
- Use of funds:
  - 40% engineering (integrations, enterprise controls, reliability)
  - 35% GTM (founder-led sales, design partner pipeline)
  - 15% security/compliance
  - 10% ops

## Founders

- **[FOUNDER NAME]** - [ROLE], [technical background], [why uniquely suited]
- **[CO-FOUNDER NAME]** - [ROLE], [domain background]

## Vision

AgentMD becomes the default governance layer for autonomous software delivery workflows.
