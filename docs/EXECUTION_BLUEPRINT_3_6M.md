# Execution Blueprint: Phase 1 + Early Phase 2 (3–6 Months)

**Document Type:** Tactical Roadmap  
**Last Updated:** February 2026  
**Status:** Active  
**See also:** [PLATFORM_ROADMAP_STRATEGY.md](./PLATFORM_ROADMAP_STRATEGY.md), [ROADMAP.md](./ROADMAP.md)

---

## Vision: "Vercel for Agentic AI"

AgentMD reframes from **spec + validator** into a **full platform**: the place where teams define, run, and observe agentic workloads with almost no infra friction.

| Vercel Concept                          | AgentMD Translation                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| Zero-config for common cases            | Point repos at AgentMD → things "just work"                                             |
| Framework-defined infra                 | AGENTS.md defines how agents run, which tools they have, what policies apply            |
| One platform for define → run → observe | Define agents + policies → Run them (serverless-style) → Observe (logs, traces, safety) |

---

## Current State (What Exists)

| Capability                        | Status | Notes                                                      |
| --------------------------------- | ------ | ---------------------------------------------------------- |
| AGENTS.md parsing & validation    | ✅     | `@agentmd/core`, validator.ts                              |
| Agent-readiness score             | ✅     | 0–100 with actionable feedback                             |
| CLI (check, run, score, init)     | ✅     | `@agentmd-dev/cli`                                         |
| GitHub Action                     | ✅     | `.github/actions/agentmd`, validate-agents-md.yml          |
| Templates (Node, Python, Rust)    | ✅     | docs/AGENTS_MD_TEMPLATES.md                                |
| Dashboard (repos, runs)           | ✅     | apps/dashboard                                             |
| Execute API + worker              | ✅     | Real execution for public repos (AGENTMD_REAL_EXECUTION=1) |
| Badge API                         | ✅     | `/api/badge/score`                                         |
| PR comments with improvements     | ❌     | Not yet — validation runs, no PR comment                   |
| Safe command schema (risk levels) | ⚠️     | Partial — `isCommandSafe`, no formal schema                |
| IDE integrations                  | ❌     | Not yet                                                    |
| Hosted workflows (presets)        | ❌     | Not yet                                                    |
| Observability / safety center     | ⚠️     | Basic execution history, no timeline/safety events         |

---

## Exact Features to Ship (Next 3–6 Months)

### Phase 1.1 — Make AGENTS.md Obviously Useful (Months 1–2)

| Feature                          | Priority | Scope                                                                                                                                                                                                                           | Outcome                                                   |
| -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **PR comment on validation**     | P0       | GitHub Action outputs validation result; use `github-script` or `actions/github-script` to post a comment with errors, warnings, score, and concrete improvements (missing commands, unclear safety, conflicting instructions). | Every PR gets actionable feedback without leaving GitHub. |
| **Battle-tested templates**      | P0       | Add Next.js, Django, Rails, monorepo templates to `docs/AGENTS_MD_TEMPLATES.md` and `agentmd init --template`. Ensure each has clear risk levels and guardrails.                                                                | New users get "works out of the box" for popular stacks.  |
| **Safe command schema**          | P0       | Extend frontmatter/parser: `risk_level` (safe \| read-only \| write \| dangerous), `preconditions`, `audit_tags`. Document in spec. Enforce in validator.                                                                       | AgentMD is source of truth for what agents may do.        |
| **Dashboard: repo health score** | P1       | Per-repo "health score" (reuse agent-readiness), recent validation results, last run status. Simple list view.                                                                                                                  | Teams see at a glance which repos are agent-ready.        |
| **CLI: `agentmd improve`**       | P1       | Already exists; ensure it outputs concrete suggestions (missing sections, unsafe commands, unclear descriptions).                                                                                                               | Devs can self-serve improvements.                         |

### Phase 1.2 — Deep Integrations (Months 2–3)

| Feature                             | Priority | Scope                                                                                                                                                             | Outcome                                        |
| ----------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **GitHub App (or enhanced Action)** | P0       | Either: (a) GitHub App that comments on PRs automatically, or (b) reusable composite Action that posts PR comment. Prefer (b) for speed — no OAuth flow.          | Zero-config PR feedback.                       |
| **CI fail on invalid AGENTS.md**    | P1       | Action input: `fail-on-warning: false \| true`. When true, exit 1 on validation errors. Document in quickstart.                                                   | Teams enforce AGENTS.md quality in CI.         |
| **Cursor rule / skill**             | P1       | Cursor rule or skill that reads AGENTS.md and exposes commands as suggested actions. Lightweight: "When editing this repo, prefer these commands from AGENTS.md." | Cursor users feel missing out without AgentMD. |
| **VS Code extension (optional)**    | P2       | Simple: show AGENTS.md status in status bar, run `agentmd score` on save.                                                                                         | Broader IDE reach.                             |

### Phase 2.1 — First Flagship Workflow (Months 3–4)

**Pick one workflow and ship it end-to-end.** Recommendation: **PR Reviewer Agent**.

| Component         | Scope                                                                                                                                          | Notes                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Config**        | AGENTS.md section or frontmatter: `workflows.pr_reviewer: enabled \| disabled`                                                                 | Minimal config.                                        |
| **Execution**     | Hosted job: on PR open/update, fetch AGENTS.md + diff + test results → run review logic (rules-based or LLM) → post structured review comment. | Uses existing execute API + worker; add workflow type. |
| **UI**            | Dashboard: "Workflows" tab per repo. Enable/disable PR Reviewer. Show last run, link to PR.                                                    | One-click enable.                                      |
| **Observability** | Per-run log: what was reviewed, what was posted. Simple timeline.                                                                              | Proves value.                                          |

**Why PR Reviewer first:**

- High perceived value (every team does PR reviews)
- Clear input/output (diff → comment)
- Reuses AGENTS.md as policy (what to check, what to allow)
- Dogfoodable on AgentMD's own repos

**Alternative flagships:** Test Failure Triage, Docs Sync. Defer to Month 5–6 if PR Reviewer ships fast.

### Phase 2.2 — Observability & Safety (Months 4–6)

| Feature                           | Priority | Scope                                                                                             | Outcome                              |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Execution timeline**            | P0       | Dashboard: per-execution view with steps in order, duration, status, stdout/stderr expandable.    | "What ran, in what order, how long." |
| **Safety events**                 | P0       | Log when: disallowed command attempted, approval required, manual override. Surface in dashboard. | Safety center雏形.                   |
| **Per-repo execution history**    | P1       | Already partially there; ensure filtering by workflow type, date range, status.                   | Teams audit agent activity.          |
| **Webhook on execution complete** | P1       | POST to user-configured URL with execution summary.                                               | Integrate with Slack, etc.           |

---

## Flagship Workflow: PR Reviewer Agent (Detailed)

### User Story

> As a maintainer, I want every PR to get an automated review based on AGENTS.md, so I can catch issues before human review and ensure agent-related policies are followed.

### Flow

1. **Trigger:** PR opened or updated (via GitHub webhook or scheduled check).
2. **Input:** AGENTS.md (parsed), PR diff, CI status (if available), PR metadata.
3. **Logic:**
   - Extract commands and guardrails from AGENTS.md.
   - Check diff against: new dangerous commands, missing tests for changed files, PR title/body format.
   - Optionally: call LLM for semantic review (e.g., "Does this change align with guardrails?"). Start rules-based only to ship faster.
4. **Output:** Structured comment on PR with:
   - Summary (pass / needs attention)
   - Checklist of checks (AGENTS.md compliance, test coverage, etc.)
   - Actionable suggestions

### Config (AGENTS.md)

```yaml
---
workflows:
  pr_reviewer:
    enabled: true
    # Optional: rules-based only (default) or llm-assisted
    mode: rules # rules | llm
---
```

### Implementation Phases

| Phase | Scope                                                                                                                   | Est.                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **A** | Webhook: on PR event, enqueue job. Worker: fetch AGENTS.md + diff, run rules-based checks, post comment via GitHub API. | 2–3 weeks                 |
| **B** | Dashboard: enable/disable per repo. Show last run + link.                                                               | 1 week                    |
| **C** | LLM-assisted mode (optional): call OpenAI/Anthropic for semantic review. User provides API key or we bill usage.        | 2 weeks (defer if needed) |

### Success Metrics

- 10+ repos using PR Reviewer by Month 6
- 80%+ of reviews post within 2 min of PR update
- NPS or qualitative feedback from 3+ design partners

---

## Pricing Alignment with Phases

### Principle

Pricing should grow as value grows: Phase 1 = "agent-ready repo" (Free/Pro); Phase 2 = "run + observe" (Pro/Team); Phase 3 = "platform" (Enterprise, Marketplace).

### Current Plans (Keep)

| Plan           | Price   | Phase 1 Focus                                          | Phase 2 Add                                 |
| -------------- | ------- | ------------------------------------------------------ | ------------------------------------------- |
| **Free**       | $0      | 3 repos, 100 min, basic validation, badge              | Same                                        |
| **Pro**        | $49/mo  | Unlimited repos, 1K min, PR comments, health dashboard | Workflows (1–2 presets), timeline, webhooks |
| **Enterprise** | $249/mo | SSO, RBAC, audit logs                                  | Self-hosted, SLA, design partner perks      |

### Phase 2 Additions (Months 4–6)

| Plan                     | New Capability                                                 | Price Impact                          |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------- |
| **Pro**                  | PR Reviewer workflow included (e.g., 50 runs/mo), then overage | No change to base price               |
| **Team** (new, optional) | $99/mo — 5 seats, shared workflows, 2K min                     | Introduced when workflows prove value |
| **Enterprise**           | Custom workflows, priority workflow slots                      | Same                                  |

### Usage-Based Add-Ons (Phase 2+)

- Execution minutes overage: $0.05/min
- Workflow runs overage: $0.10/run (when LLM-assisted)
- Eval runs (future): $0.10/run

### Revenue Targets (6 Months)

| Metric                | Conservative | Optimistic |
| --------------------- | ------------ | ---------- |
| Paid (Pro + Team)     | 50           | 150        |
| Enterprise            | 2            | 5          |
| MRR                   | $3K          | $10K       |
| AppSumo (if launched) | 100          | 300        |

---

## Practical Next Steps (Solo Founder + AI)

### Week 1–2

- [ ] Implement PR comment in GitHub Action (validation result → `github-script` comment)
- [ ] Add Next.js + Django templates to AGENTS_MD_TEMPLATES.md and `agentmd init`
- [ ] Document safe command schema in core types and validator

### Week 3–4

- [ ] Dashboard: repo list with health score, last validation
- [ ] CI fail-on-invalid option in Action
- [ ] Cursor rule/skill: "Read AGENTS.md, suggest commands"

### Week 5–8

- [ ] PR Reviewer workflow: webhook → worker → GitHub comment (rules-based)
- [ ] Dashboard: Workflows tab, enable/disable PR Reviewer

### Week 9–12

- [ ] Execution timeline view in dashboard
- [ ] Safety events (disallowed command attempted, etc.)
- [ ] Dogfood PR Reviewer on AgentMD repos
- [ ] Land 2–3 design partners

### Month 4–6

- [ ] Second flagship workflow (Test Triage or Docs Sync) or LLM-assisted PR Reviewer
- [ ] Webhook on execution complete
- [ ] Team plan (if traction justifies)

---

## Design Partner Criteria

- Small, AI-forward team (2–10 devs)
- Already using Cursor, Copilot, or Claude for coding
- Willing to run AgentMD on 2+ repos for 4+ weeks
- Feedback loop: 1 call every 2 weeks

---

## References

- [PLATFORM_ROADMAP_STRATEGY.md](./PLATFORM_ROADMAP_STRATEGY.md) — Full 3-phase strategy
- [REAL_EXECUTION_DESIGN.md](./REAL_EXECUTION_DESIGN.md) — Worker execution model
- [AGENTS_MD_TEMPLATES.md](./AGENTS_MD_TEMPLATES.md) — Current templates
- [CORE_ENGINE_SPEC.md](./CORE_ENGINE_SPEC.md) — Validation & scoring rules
