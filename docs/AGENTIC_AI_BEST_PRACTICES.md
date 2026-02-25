# Agentic AI Best Practices (2026)

AgentMD aligns with IBM's 2026 guidance for agentic AI: **observable**, **adaptive**, and **accountable** systems. This document summarizes best practices and how AgentMD implements them.

## Agent Lifecycle: Where AgentMD Fits

IBM describes AgentOps across five phases. AgentMD maps to each:

| Phase | AgentMD Support |
|-------|-----------------|
| **Development** | AGENTS.md defines objectives and constraints. CLI `init`, `doctor`, `improve` help author and refine the spec. |
| **Testing** | `agentmd run . --dry-run` previews execution. Sandbox mode runs in isolation. Contract validation ensures output quality. |
| **Deploy** | Human-in-the-loop for deploy steps. Permission boundaries block unauthorized commands. Kill switch cancels running executions. |
| **Monitoring** | Execution history, success rates, command-level pass/fail. OTEL export for Langfuse, Datadog, etc. |
| **Feedback** | Use failure data to refine `permissions.shell` and guardrails. ROI metrics quantify value. |

## Concrete Scenarios

### Scenario 1: Agent skips a test step

**Problem:** An AI coding assistant reads AGENTS.md and runs `pnpm build` and `pnpm lint`, but skips `pnpm test` to save time. A broken test slips into the PR.

**Solution:** AgentMD executes the full spec. Every run includes build, test, and lint in a defined order. No step is optional. Execution history shows exactly what ran and whether it passed.

### Scenario 2: Deploy without approval

**Problem:** An agent is instructed to deploy after tests pass. It does so autonomously—no human review. A misconfiguration reaches production.

**Solution:** Use policy rules with `approval: always` for deploy commands. AgentMD blocks execution until a human approves (e.g., via Slack). Audit logs record who approved and when.

### Scenario 3: Dangerous command in a prompt

**Problem:** A user (or compromised prompt) asks the agent to run `rm -rf /` or `curl ... | sh`. Without guardrails, the agent might comply.

**Solution:** AgentMD's `isCommandSafe()` blocks dangerous patterns. `permissions.shell.default: deny` with an explicit allowlist ensures only approved commands run.

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

## Further Reading

- [IBM: What is AgentOps?](https://www.ibm.com/think/topics/agentops) — Lifecycle management, observability, and the three focus areas
- [IBM: AI agent governance](https://www.ibm.com/think/insights/ai-agent-governance) — Autonomy, opacity, bias, security
- [IBM: AI agent security](https://www.ibm.com/think/topics/ai-agent-security) — Threat landscape and countermeasures
- [IBM: Agentic AI explained](https://www.ibm.com/think/topics/agentic-ai) — Key concepts and use cases
- [IBM Research: AgentOps for AI agents](https://research.ibm.com/blog/ibm-agentops-ai-agents-observability) — OTEL-based observability
