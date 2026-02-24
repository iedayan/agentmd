# Agentic AI Best Practices (2026)

AgentMD aligns with IBM's 2026 guidance for agentic AI: **observable**, **adaptive**, and **accountable** systems. This document summarizes best practices and how AgentMD implements them.

## Core Principles

### 1. Observable

- **OpenTelemetry (OTEL)** — AgentMD plans OTEL export for traces and metrics. Use standardized semantic conventions for interoperability with Langfuse, Datadog, and other observability platforms.
- **Metrics** — Track accuracy, bias, latency, success rate, and command-level pass/fail. The dashboard aggregates execution history, success rates, and audit logs.
- **Real-time investigation** — Execution logs, status, and duration are available per run for debugging and root cause analysis.

### 2. Adaptive

- **Feedback loops** — Use execution outcomes (success/failure, commands passed/failed) to refine agent configurations and permissions.
- **Human-in-the-loop** — Use policy rules with `approval: always` for sensitive operations (deploy, migrate, production changes).
- **Iterative improvement** — Adjust `permissions.shell` allowlists and guardrails based on observed failures.

### 3. Accountable

- **Audit trails** — Execution history, audit logs, and policy results provide traceability.
- **Governance** — Guardrails, permissions, and policies enforce boundaries. Cross-functional ownership and safety risk mitigation are supported through the Ops dashboard.
- **Deterministic workflows** — AgentMD executes AGENTS.md as deterministic workflows. Commands are parsed, validated, and run in a defined order with explicit permission checks. This supports governance and reproducibility.

## Deterministic Workflows

AgentMD is built on **deterministic workflows** for governance:

- Commands are extracted from AGENTS.md in a predictable order.
- Safety checks (`isCommandSafe`, `isCommandAllowed`) run before every execution.
- Permission boundaries (allow/deny lists) are explicit and version-controlled.
- Execution outcomes are deterministic given the same input and environment.

This contrasts with fully autonomous LLM-driven agents where behavior can vary between runs. Deterministic workflows make it easier to audit, debug, and comply with regulations.

## Governance Checklist

- [ ] Use `permissions.shell.default: deny` with explicit allowlists
- [ ] Add guardrails in YAML frontmatter (e.g., "Never modify production")
- [ ] Enable human-in-the-loop for sensitive operations
- [ ] Review execution history and success rates regularly
- [ ] Integrate with OTEL-compatible observability when available

## References

- [IBM AgentOps](https://www.ibm.com/think/topics/agentops) — Lifecycle management for AI agents
- [IBM AI agent governance](https://www.ibm.com/think/insights/ai-agent-governance) — Autonomy, transparency, compliance
- [IBM AI agent security](https://www.ibm.com/think/topics/ai-agent-security) — Threat landscape and countermeasures
