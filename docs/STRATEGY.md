# AgentMD Strategy & Core Concepts

This document outlines the core strategic priorities and foundational concepts of AgentMD.

## 1. Why AgentMD?

Cursor, Codex, Claude, and other AI coding tools can run commands locally. AgentMD turns the spec (AGENTS.md) into **operational truth** by executing it in a governed, team-visible environment.

| Need | Local | AgentMD |
|------|-------|---------|
| **Team visibility** | Only you see what ran | Execution history, success rates, audit logs |
| **Governance** | Your machine, your rules | Guardrails, permissions, human-in-the-loop |
| **Compliance** | No audit trail | Full traceability, EU AI Act alignment |
| **CI/CD integration** | Manual or custom scripts | PR checks, webhooks, GitHub Action |
| **Approval workflows** | None | Slack approvals for deploy, migrate |
| **ROI metrics** | Unknown | Quantified time saved, failure prevention |

## 2. Why Execute AGENTS.md?

Most teams treat AGENTS.md as read-only context. AgentMD **enforces** what the spec describes:

- **Verification** — Prove that commands (build, test, lint) actually work.
- **Enforcement** — Prevent agents from skipping steps or drifting from the spec.
- **Audit & Governance** — Trace sensitive operations with guardrails and approvals.
- **Failure Prevention** — Catch broken commands before they reach production.

## 3. Core Strategic Priorities

To ensures adoption and trust for production teams, our strategy focuses on:

### Distribution: Reach & Accessibility
- **GitHub App**: Native entry point for teams.
- **Templates**: Production-ready fragments to jumpstart setup.

### Time-to-Value (TTV)
- **First Execution < 10 Minutes**: Guide users from install to first governed execution rapidly.
- **Intuitive Wizards**: Minimize configuration overhead.

### Proof & Reliability
- **Outcome Metrics**: Quantifiable data on time saved and failure prevention.
- **Boringly Dependable**: Emphasize deterministic outcomes and production-grade resilience.

### Deep Workflow Integration
- **Slack & Jira**: Meet teams where they work with real-time approvals and issue syncing.
- **GitHub**: Deeply embedded PR checks and status updates.

## 4. AgentMD's Operational Approach

1. **Parse**: Extract commands from AGENTS.md with structure and context.
2. **Validate**: Check safety (block dangerous patterns) and permissions (allow/deny lists).
3. **Execute**: Run commands in a governed environment with sandboxing.
4. **Audit**: Log outcomes, success rates, and ROI metrics.
