# Self-Learning Agentic AI: Feasibility & Roadmap

## Current Core Engine

The `@agentmd/core` package is a **deterministic, rules-based** system:

| Component | Role | Learning? |
|-----------|------|-----------|
| **Parser** | Extracts sections, commands, frontmatter from AGENTS.md | No |
| **Validator** | Checks syntax, structure, best practices | No |
| **Executor** | Runs commands via `child_process.spawn` with guardrails | No |
| **Guardrails** | Pattern-based blocking (e.g. `rm -rf`, fork bombs) | No |

It does **not** use any ML/AI models. It follows explicit rules and executes predefined commands.

---

## What "Self-Learning Agentic AI" Would Mean

Several interpretations, from incremental to transformative:

### 1. **Adaptive Scoring (Low Effort)**

- **Idea:** Adjust readiness score weights based on observed outcomes (e.g. repos with X pattern tend to fail more).
- **Data:** Execution success/fail rates, PR merge rates.
- **Implementation:** Store metrics per repo pattern → tune score formula.
- **Scope:** Analytics + heuristic tuning, no ML.

### 2. **Suggestion Engine (Medium Effort)**

- **Idea:** Recommend AGENTS.md improvements from execution history.
- **Data:** Failed runs, common fixes, similar repos.
- **Implementation:** Embeddings of AGENTS.md content, similarity search, rule-based suggestions.
- **Scope:** Optional embeddings (e.g. OpenAI) + retrieval, still mostly deterministic.

### 3. **Autonomous Agent (High Effort)**

- **Idea:** Agent that plans, executes, and learns from feedback.
- **Data:** Full execution traces, user corrections, policy overrides.
- **Implementation:** LLM for planning, reinforcement learning or fine-tuning from feedback.
- **Scope:** New architecture, new infra (model hosting, training pipeline).

### 4. **Self-Improving Guardrails (Medium Effort)**

- **Idea:** Detect new dangerous patterns from execution incidents.
- **Data:** Blocked commands, security events, user reports.
- **Implementation:** Pattern mining + human review → update blocklist.
- **Scope:** Feedback loop + curation, no ML required.

---

## Recommended Path

**Phase 1 (Now):** Keep the core deterministic. Add:

- Execution analytics (success/fail, duration, error types).
- Optional “suggestions” from heuristics (e.g. “repos like yours often add a Lint section”).

**Phase 2 (3–6 months):** Introduce optional AI features:

- Embedding-based similarity for “repos like yours.”
- LLM-assisted suggestions for AGENTS.md (opt-in, user-triggered).
- Pattern mining for guardrail updates.

**Phase 3 (6–12 months):** Explore agentic behavior:

- Planning layer that proposes command sequences.
- Feedback loop: user approves/rejects → improve suggestions.
- Optional autonomous mode with strict boundaries.

---

## Why Not Jump Straight to Agentic AI?

1. **Trust:** Deterministic behavior is easier to reason about and audit.
2. **Cost:** LLMs add latency and cost; not all users need them.
3. **Compliance:** EU AI Act and similar rules treat autonomous systems differently.
4. **Focus:** Current value is “execute AGENTS.md reliably”; AI can enhance, not replace, that.

---

## Summary

| Approach | Effort | Value | Risk |
|----------|--------|-------|------|
| Adaptive scoring | Low | Medium | Low |
| Suggestion engine | Medium | High | Low |
| Self-improving guardrails | Medium | High | Low |
| Full autonomous agent | High | Very high | High |

**Recommendation:** Start with Phase 1 analytics and heuristic suggestions. Add optional AI features in Phase 2. Treat full agentic AI as a longer-term direction, not an immediate rewrite.
