import Link from "next/link";

export default function BestPracticesPage() {
  return (
    <div>
      <h1>Agentic AI Best Practices (2026)</h1>
      <p className="lead">
        AgentMD aligns with IBM&apos;s 2026 guidance for agentic AI: observable, adaptive, and accountable systems.
      </p>

      <h2>Core Principles</h2>

      <h3>1. Observable</h3>
      <ul>
        <li>
          <strong>OpenTelemetry (OTEL)</strong> — AgentMD plans OTEL export for traces and metrics. Use standardized semantic conventions for interoperability with Langfuse, Datadog, and other observability platforms.
        </li>
        <li>
          <strong>Metrics</strong> — Track accuracy, bias, latency, success rate, and command-level pass/fail. The dashboard aggregates execution history, success rates, and audit logs.
        </li>
        <li>
          <strong>Real-time investigation</strong> — Execution logs, status, and duration are available per run for debugging and root cause analysis.
        </li>
      </ul>

      <h3>2. Adaptive</h3>
      <ul>
        <li>
          <strong>Feedback loops</strong> — Use execution outcomes (success/failure, commands passed/failed) to refine agent configurations and permissions.
        </li>
        <li>
          <strong>Human-in-the-loop</strong> — Use policy rules with <code>approval: always</code> for sensitive operations (deploy, migrate, production changes).
        </li>
        <li>
          <strong>Iterative improvement</strong> — Adjust <code>permissions.shell</code> allowlists and guardrails based on observed failures.
        </li>
      </ul>

      <h3>3. Accountable</h3>
      <ul>
        <li>
          <strong>Audit trails</strong> — Execution history, audit logs, and policy results provide traceability.
        </li>
        <li>
          <strong>Governance</strong> — Guardrails, permissions, and policies enforce boundaries. Cross-functional ownership and safety risk mitigation are supported through the Ops dashboard.
        </li>
        <li>
          <strong>Deterministic workflows</strong> — AgentMD executes AGENTS.md as deterministic workflows. Commands are parsed, validated, and run in a defined order with explicit permission checks. This supports governance and reproducibility.
        </li>
      </ul>

      <h2>Deterministic Workflows</h2>
      <p>
        AgentMD is built on <strong>deterministic workflows</strong> for governance:
      </p>
      <ul>
        <li>Commands are extracted from AGENTS.md in a predictable order.</li>
        <li>Safety checks (<code>isCommandSafe</code>, <code>isCommandAllowed</code>) run before every execution.</li>
        <li>Permission boundaries (allow/deny lists) are explicit and version-controlled.</li>
        <li>Execution outcomes are deterministic given the same input and environment.</li>
      </ul>
      <p>
        This contrasts with fully autonomous LLM-driven agents where behavior can vary between runs. Deterministic workflows make it easier to audit, debug, and comply with regulations.
      </p>

      <h2>Governance Checklist</h2>
      <ul>
        <li>Use <code>permissions.shell.default: deny</code> with explicit allowlists</li>
        <li>Add guardrails in YAML frontmatter (e.g., &quot;Never modify production&quot;)</li>
        <li>Enable human-in-the-loop for sensitive operations</li>
        <li>Review execution history and success rates regularly</li>
        <li>Integrate with OTEL-compatible observability when available</li>
      </ul>

      <h2>References</h2>
      <ul>
        <li>
          <a href="https://www.ibm.com/think/topics/agentops" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            IBM AgentOps
          </a>
          {" "}
          — Lifecycle management for AI agents
        </li>
        <li>
          <a href="https://www.ibm.com/think/insights/ai-agent-governance" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            IBM AI agent governance
          </a>
          {" "}
          — Autonomy, transparency, compliance
        </li>
        <li>
          <a href="https://www.ibm.com/think/topics/ai-agent-security" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            IBM AI agent security
          </a>
          {" "}
          — Threat landscape and countermeasures
        </li>
      </ul>

      <p className="mt-8">
        <Link href="/docs/execution" className="text-primary hover:underline">
          ← Execution &amp; Safety
        </Link>
      </p>
    </div>
  );
}
