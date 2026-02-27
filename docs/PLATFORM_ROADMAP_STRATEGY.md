# AgentMD Platform Roadmap: "Vercel for Agentic AI"

**Document Type:** Strategic Roadmap  
**Author:** Product Strategy & Technical Architecture  
**Last Updated:** February 2025  
**Status:** Planning

---

## Executive Summary (Pitch-Ready)

**AgentMD is evolving from a governance/execution tool into the full-stack platform for production agentic AI—the "Vercel for Agentic AI."**

We start with a unique moat: **AGENTS.md execution**. While observability tools (AgentOps, LangFuse) watch what agents do, and orchestration tools (Temporal, Inngest) run workflows, AgentMD is the only platform that **executes the AGENTS.md standard itself**—the spec backed by the Linux Foundation, OpenAI, Microsoft, Google, and AWS, with 60K+ repos adopting it.

Our wedge: **Governance-first execution**. We don't add observability as an afterthought; we build execution with guardrails, policies, and audit trails from day one. That positions us to own the full stack: build → deploy → monitor → govern.

**The bet:** As agentic AI moves from experimentation to production, enterprises will need a single platform that handles the entire lifecycle. We aim to be that platform.

---

## Part 1: Three-Phase Roadmap

### Phase 1 (Now–6 Months): Foundation & Distribution

**Current state:** AGENTS.md execution, CLI, basic dashboard, GitHub integration, governance controls.

#### Core Features to Build

| Feature | Priority | Rationale |
|---------|----------|-----------|
| **Stable execution runtime** | P0 | Reliability is table stakes. Fix flakiness, improve sandboxing, deterministic runs. |
| **Agent-readiness score as a badge** | P0 | Viral distribution. Every repo with a badge drives traffic. |
| **GitHub App + PR checks** | P0 | Reduces friction. "Connect repo → get checks" in &lt;5 min. |
| **Execution history & basic analytics** | P1 | Proves value. "You ran 47 workflows this month; 3 failed." |
| **AppSumo launch** | P1 | Early revenue + user validation. 800K+ audience. |
| **Stripe Pro/Enterprise checkout** | P1 | Revenue path. Already wired; needs polish. |
| **Docs & quickstart** | P1 | Time-to-value. First governed run in &lt;10 min. |
| **Marketplace (agent directory)** | P2 | Ecosystem play. Curated AGENTS.md templates. |

#### Target Users & Pain Points

| Segment | Pain Point | How We Solve |
|---------|------------|--------------|
| **Solo devs / indie hackers** | Agents run commands inconsistently; no audit trail | Deterministic execution, score, logs |
| **Small teams (2–10)** | Need governance before scaling; can't afford enterprise tools | Pro tier ($49/mo), approval workflows |
| **Early adopters** | Want to be "agent-ready" for Cursor, Claude, Copilot | AGENTS.md as universal spec; we execute it |

#### Key Metrics

- **MAU** (monthly active users): Target 500–2,000 by month 6
- **Repos connected:** 200–800
- **Execution runs/month:** 5,000–25,000
- **Conversion to paid:** 2–5% (Free → Pro or AppSumo)
- **NPS:** &gt;30

#### Technical Architecture Considerations

- **Execution engine:** Keep sandboxed, reproducible. Consider WebAssembly for portability.
- **Data model:** Ensure `executions`, `repositories`, `users` schema supports future observability (traces, spans).
- **API design:** REST today; plan for webhooks and event streams (Phase 2).
- **Avoid:** Building custom orchestration. Integrate with existing (GitHub Actions, etc.) rather than replace.

#### Competitive Positioning

| Competitor | Their Focus | Our Angle |
|------------|--------------|-----------|
| **AgentOps** | Observability, traces, costs | We execute; they observe. We're upstream. |
| **LangFuse / Helicone** | LLM observability | We're workflow/execution; complementary. |
| **Temporal / Inngest** | Durable workflows | We run AGENTS.md; they run arbitrary code. Different layer. |
| **Cursor / Copilot** | AI coding | We're the runtime for their outputs. Integrate, don't compete. |

**Differentiation:** We own the **AGENTS.md execution layer**. No one else executes the spec. That's the wedge.

#### Revenue Model & Pricing (Phase 1)

| Plan | Price | Target |
|------|-------|--------|
| Free | $0 | Acquisition, viral |
| Pro | $49/mo | 50–200 paying |
| Enterprise | $249/mo | 2–5 early |
| AppSumo | $69–299 one-time | 100–500 lifetime |

**Revenue (6 months):** $3K–15K MRR (conservative).

#### Timeline & Resources

- **Team:** 1–2 full-time (founder + 1 dev or PM)
- **Milestones:** AppSumo launch (M2), Stripe polish (M3), 500 MAU (M6)

---

### Phase 2 (6–18 Months): Agentic Workflow Platform

**Goal:** Evolve from "execution tool" to "workflow platform" with orchestration, observability, and testing.

#### Core Features to Build

| Feature | Priority | Rationale |
|---------|----------|-----------|
| **Orchestration layer** | P0 | Multi-step workflows, retries, dependencies. "Run agent A, then B, then deploy." |
| **Observability & traces** | P0 | Execution → span/trace model. See what ran, latency, costs. |
| **Agent testing framework** | P0 | "Eval as a service." Run evals against AGENTS.md; regression detection. |
| **Webhooks & event stream** | P1 | Integrate with Slack, Jira, PagerDuty. Event-driven. |
| **Cost attribution** | P1 | Per-repo, per-workflow LLM/execution costs. FinOps for agents. |
| **Team collaboration** | P1 | Shared dashboards, roles, approval chains. |
| **Self-hosted option** | P1 | Enterprise requirement. Air-gapped, on-prem. |
| **SSO / RBAC** | P1 | Enterprise table stakes. |
| **AgentOps / LangFuse integration** | P2 | Don't rebuild. Ingest our events; they visualize. |

#### Target Users & Pain Points

| Segment | Pain Point | How We Solve |
|---------|------------|--------------|
| **Growth-stage startups** | Agents in prod; need observability + governance | Traces + policies + cost dashboards |
| **Platform teams** | Building internal agent infrastructure | Orchestration API, webhooks, self-hosted |
| **Compliance-heavy orgs** | Need audit trails, approval workflows | RBAC, SSO, immutable logs |
| **Dev teams** | Agent regressions in CI | Eval framework, regression alerts |

#### Key Metrics

- **MAU:** 2,000–10,000
- **Repos connected:** 1,000–5,000
- **Execution runs/month:** 50,000–250,000
- **Paid conversion:** 5–8%
- **Enterprise deals:** 5–15 ($249+/mo)
- **ARR:** $150K–500K

#### Technical Architecture Considerations

- **Orchestration:** Evaluate Temporal vs. Inngest vs. build-light. Recommendation: **integrate** (Inngest for serverless, or Temporal for durable). Don't build from scratch.
- **Observability:** Adopt OpenTelemetry. Spans for each execution step. Export to AgentOps, Datadog, etc.
- **Testing:** Eval runs as a first-class execution type. Store baselines; diff on changes.
- **Data:** Time-series for metrics. Consider ClickHouse or Timescale for cost/usage analytics.

#### Competitive Positioning

| Competitor | Threat Level | Strategy |
|------------|--------------|----------|
| **AgentOps** | Medium | They add execution? Unlikely. We add observability? Yes. Position as "execution + governance"; partner on traces. |
| **Temporal** | Low | They're infra. We're product. Integrate for complex workflows. |
| **Vercel** | Medium | They have `npx @next/codemod agents-md`. They could build execution. **Move fast.** Own the execution layer before they do. |
| **Microsoft / Google** | High (long-term) | They'll enter. Moat = AGENTS.md standard + ecosystem. Be the default before they scale. |

#### Revenue Model & Pricing (Phase 2)

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | 3 repos, 100 min/mo |
| Pro | $49/mo | Unlimited repos, 1K min, observability |
| Team | $99/mo (new) | 5 seats, shared dashboards, eval framework |
| Enterprise | $249–499/mo | SSO, RBAC, self-hosted, SLA |

**Usage-based add-ons:** Execution minutes overage ($0.05/min), eval runs ($0.10/run).

#### Timeline & Resources

- **Team:** 3–5 (2 eng, 1 PM/product, 1 growth/sales)
- **Milestones:** Orchestration (M9), Observability (M10), Eval framework (M12), 5 Enterprise (M18)

---

### Phase 3 (18–36 Months): Full "Vercel for Agentic AI"

**Goal:** Complete platform—build, deploy, monitor, govern. The default choice for production agentic AI.

#### Core Features to Build

| Feature | Priority | Rationale |
|---------|----------|-----------|
| **Agent deployment/hosting** | P0 | "Deploy your agent." Serverless or container. Like Vercel for agents. |
| **Agent registry & marketplace** | P0 | Discover, install, compose agents. npm for agents. |
| **Unified control plane** | P0 | One dashboard: repos, agents, executions, costs, policies. |
| **Policy engine (advanced)** | P0 | Fine-grained: "Agent X can only call API Y during business hours." |
| **Cost optimization** | P1 | Auto-scaling, caching, model routing. FinOps for agents. |
| **Multi-cloud / hybrid** | P1 | Run on AWS, GCP, Azure, on-prem. |
| **Compliance certifications** | P1 | SOC2, HIPAA, FedRAMP. Enterprise sales unlock. |
| **Agent composition** | P1 | Multi-agent workflows. Agent A → Agent B → Agent C. |
| **Developer experience** | P1 | SDK, local dev, preview environments. |

#### The "Killer Feature"

**The killer feature is not one thing—it's the integration of three:**

1. **AGENTS.md as the universal contract** — Every agent, every tool, speaks the same language. We execute it.
2. **Governance by default** — No "add observability later." Policies, approvals, audit from day one.
3. **Deploy in one click** — From AGENTS.md to production agent. No infra wrestling.

**Indispensability:** Once a team has 10+ agents in production, governed by AgentMD, switching cost is high. We become the system of record.

#### Competing with Big Tech

| Risk | Mitigation |
|------|------------|
| **Microsoft integrates AGENTS.md into GitHub** | We're already the execution layer. Partner or acquire. Move upstack (deployment, marketplace). |
| **Google builds agent platform** | Open standard (AGENTS.md) prevents lock-in. We're standard-compliant; they'd have to support us. |
| **AWS launches AgentOps competitor** | We're multi-cloud. Don't depend on one vendor. |
| **OpenAI builds execution** | Unlikely—they're model-focused. We're infra. Integrate deeply. |

**Moat:** Linux Foundation standard + 60K+ repos + first-mover in execution. Ecosystem lock-in.

#### Revenue Model & Pricing (Phase 3)

| Plan | Price | Target |
|------|-------|--------|
| Free | $0 | 3 repos, 100 min |
| Pro | $79/mo | Individuals, small teams |
| Team | $199/mo | 10 seats, shared everything |
| Enterprise | $499–2,000/mo | Custom contracts, volume |
| Platform (new) | % of usage | Marketplace, deployment fees |

**Revenue (36 months):** $1M–5M ARR (aspirational).

#### Timeline & Resources

- **Team:** 8–15 (eng, product, sales, success)
- **Milestones:** Agent deployment (M24), Marketplace v2 (M30), 50 Enterprise (M36)

---

## Part 2: Competitive Landscape Analysis

| Company | Focus | Funding | Threat | Our Response |
|---------|-------|---------|--------|--------------|
| **AgentOps** | Observability, traces, costs | $2.6M | Medium | We execute; they observe. Partner on integration. Don't compete on observability alone. |
| **WitnessAI** | Governance, compliance | $58M | High | They're governance-first. We're execution-first governance. Different wedge. |
| **LangFuse** | LLM observability | OSS + cloud | Low | Complementary. We send them traces. |
| **Temporal** | Durable workflows | $100M+ | Low | Infra layer. We integrate. |
| **Inngest** | Serverless workflows | $3M | Low | Event-driven. We can use for orchestration. |
| **Cursor** | AI coding | $1B ARR | Partner | We're the runtime for their outputs. Integrate. |
| **Vercel** | Frontend deployment | $150M+ | Medium | They have AGENTS.md tooling. Could add execution. **Speed matters.** |
| **Microsoft (GitHub Copilot)** | AI in dev | Big tech | High | Could own AGENTS.md. We need ecosystem before they scale. |

**Summary:** Our unique position is **AGENTS.md execution + governance**. No one else does both. Observability players watch; we run. Orchestration players run arbitrary code; we run the standard.

---

## Part 3: Financial Model (Rough)

### Phase 1 (6 months)

| Metric | Conservative | Optimistic |
|--------|--------------|------------|
| MAU | 500 | 2,000 |
| Paid (Pro + AppSumo) | 50 | 200 |
| Enterprise | 1 | 5 |
| MRR | $3K | $15K |
| ARR | $36K | $180K |

### Phase 2 (18 months)

| Metric | Conservative | Optimistic |
|--------|--------------|------------|
| MAU | 2,000 | 10,000 |
| Paid | 150 | 600 |
| Enterprise | 5 | 15 |
| MRR | $15K | $50K |
| ARR | $180K | $600K |

### Phase 3 (36 months)

| Metric | Conservative | Optimistic |
|--------|--------------|------------|
| MAU | 5,000 | 25,000 |
| Paid | 400 | 2,000 |
| Enterprise | 20 | 50 |
| MRR | $50K | $200K |
| ARR | $600K | $2.4M |

**Caveats:** Assumes 2–5% conversion, $49–249 blended ASP. Enterprise can 2–3x ARR if deals are larger.

---

## Part 4: Critical Questions Answered

### 1. Differentiation: How do we avoid becoming "just another observability tool"?

**Answer:** We lead with **execution**, not observation. Our tagline: "We run what agents should do." Observability is a feature, not the product. The wedge is AGENTS.md execution + governance. If we add observability, it's in service of execution (e.g., "this run failed because X"). We're not trying to replace Datadog; we're the runtime for agentic workflows.

### 2. Ecosystem: How do we leverage AGENTS.md as a moat?

**Answer:**
- **Standard compliance:** We're the reference implementation. Contribute to the spec.
- **Distribution:** 60K+ repos. Every one is a potential user. Badge, templates, marketplace.
- **Ecosystem lock-in:** Once teams standardize on AGENTS.md + AgentMD, switching means rewriting workflows.
- **Partner integrations:** Cursor, Copilot, Claude—they output AGENTS.md. We execute it. We're in their workflow.

### 3. Go-to-market: Bottom-up or enterprise?

**Answer:** **Bottom-up first.** 
- Phase 1–2: Developers, small teams. Product-led growth. AppSumo, docs, GitHub.
- Phase 2–3: Add enterprise sales when we have 5+ Enterprise logos and case studies.
- Rationale: Enterprise sales require proof. Proof comes from usage. Usage comes from developers.

### 4. Integration vs. build: What to integrate vs. build ourselves?

| Capability | Integrate | Build | Rationale |
|------------|-----------|-------|-----------|
| Orchestration | Inngest / Temporal | — | Mature, battle-tested. Don't reinvent. |
| Observability | AgentOps, LangFuse (export) | Basic traces | They're better at viz. We send events. |
| Testing/evals | — | Eval framework | No good agent-specific eval platform. Opportunity. |
| Deployment | Vercel, Railway, Fly | — | Use existing. We're not a cloud. |
| Auth | NextAuth, Auth0 | — | Standard. |
| Billing | Stripe | — | Standard. |

### 5. Technical foundation: What choices enable or limit future expansion?

| Choice | Enable | Limit |
|--------|--------|-------|
| **AGENTS.md as source of truth** | Standard compliance, ecosystem | Must evolve with spec |
| **Sandboxed execution** | Security, reproducibility | Performance overhead |
| **REST API first** | Simplicity | Add webhooks/events for scale |
| **Postgres + Neon** | Good for structured data | Add time-series DB for metrics |
| **Next.js dashboard** | Fast iteration | May need separate admin at scale |

**Recommendation:** Add OpenTelemetry early. Add webhook/event system in Phase 2. Keep execution engine modular for future orchestration integration.

---

## Part 5: Key Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **AGENTS.md adoption stalls** | Medium | High | Diversify: support other agent specs (Cursor skills, etc.). Don't bet everything on one standard. |
| **Vercel builds execution** | Medium | High | Move fast. Own execution before they do. Partner if they're interested. |
| **Enterprise sales cycle long** | High | Medium | Start with SMB/startup. Enterprise when we have proof. |
| **Observability commoditized** | High | Low | We're not an observability company. Execution is the wedge. |
| **Funding required before profitability** | Medium | High | Phase 1–2 should be capital-efficient. AppSumo + Pro can fund growth. Raise when we have traction. |
| **Solo founder bottleneck** | High | Medium | Hire first key hire (eng or PM) by M6. |

---

## Part 6: Pitch-Ready Summary

**One-liner:** AgentMD is the "Vercel for Agentic AI"—the full-stack platform for building, deploying, monitoring, and governing production agentic AI systems.

**Problem:** 60K+ repos use AGENTS.md, but no one executes it with governance. Enterprises want agentic AI (85% within 3 years) but only 6% have mature governance. 52% cite security/compliance as the top blocker.

**Solution:** We make AGENTS.md executable—parse, validate, run—with built-in guardrails, approval workflows, and audit trails. We're evolving into the complete platform: orchestration, observability, testing, deployment.

**Traction:** 60K+ repos on the standard. AppSumo launch. Pro/Enterprise pricing live.

**Market:** AI governance $4.83B by 2034 (35–45% CAGR). AgentOps $2.6M, WitnessAI $58M. Cursor $1B ARR. Lovable $100M ARR in 8 months.

**Moat:** AGENTS.md execution layer. Linux Foundation standard. First-mover. Ecosystem.

**Ask:** [Customize: e.g., "We're raising a seed to scale to 10K MAU and 5 Enterprise logos."]

---

*Document ends. Use as living strategy; update quarterly.*
