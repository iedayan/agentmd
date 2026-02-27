# AgentMD Roadmap

**Vision:** "Vercel for Agentic AI" — the platform where teams define, run, and observe agentic workloads with minimal infra friction.

**Tactical blueprint (3–6 months):** [EXECUTION_BLUEPRINT_3_6M.md](./EXECUTION_BLUEPRINT_3_6M.md)  
**Full strategy:** [PLATFORM_ROADMAP_STRATEGY.md](./PLATFORM_ROADMAP_STRATEGY.md)

---

## Phase 1 — Nail the "Agent-Ready Repo" (0–6 months)

**Goal:** Become the default way to make repos agent-ready and safe.

- AGENTS.md templates for popular stacks (Next.js, Django, Rails, monorepos)
- CLI + GitHub Action that validates on every PR and comments with concrete improvements
- Dashboard: repo list, health scores, recent validation results
- Strong "safe command" model (risk levels, preconditions, audit tags)
- Integrations: Cursor, VS Code, CI/CD (fail on invalid)

**Outcome:** Teams using AI coding agents see AgentMD as the easiest way to standardize behavior.

---

## Phase 2 — Runtime for Agentic Workloads (6–18 months)

**Goal:** Don't just define what agents should do — run and orchestrate them.

- Hosted execution for commands/tools from AGENTS.md
- Opinionated workflows: PR Reviewer, Test Failure Triage, Docs Sync
- Observability & safety center: timeline, safety events, per-repo dashboards

**Outcome:** "Click to run this agentic workflow safely" — not just static config.

---

## Phase 3 — Platform for Platforms (18–36 months)

**Goal:** Enable others to use AgentMD as their agent cloud.

- Orgs/workspaces, RBAC, multi-tenant boundaries
- APIs/SDKs for third-party tools to run workflows on AgentMD
- Marketplace: reusable templates, workflows, tools

**Outcome:** AgentMD is the platform many agent tools defer to for policy & execution.

---

## Phase 4 — Vercel-Level Polish & Moat

**Goal:** Experience so smooth that switching away feels painful.

- One-click onboarding, great docs, friendly dashboards
- Fast execution, strong SLAs
- SOC2/ISO roadmaps for enterprise
- Moat: AGENTS.md standard + ecosystem lock-in, deep integrations, data/insight

---

## Practical Next 6–12 Months

1. **Strengthen AGENTS.md** as the canonical standard (templates, validation, health score)
2. **Ship 2–3 flagship workflows** end-to-end (PR Reviewer first)
3. **Dogfood** on AgentMD's own repos
4. **Land design partners** — small, AI-forward teams
5. **Then** pursue platform-for-platforms

---

## Community & Risk Management

- Nurture contributions around AGENTS.md and execution runtime
- Privacy, data governance, and security top of mind from day one
