import Link from "next/link";

export default function EuAiActPage() {
  return (
    <div>
      <h1>EU AI Act Compliance</h1>
      <p className="lead">
        AgentMD helps you align with the EU AI Act risk classification and compliance workflows for AI agents.
      </p>

      <h2>Risk Classification</h2>
      <p>
        The EU AI Act classifies AI systems by risk level. AgentMD executions fall into these categories:
      </p>
      <ul>
        <li>
          <strong>Minimal risk</strong> — Build, test, lint, and validation commands. No human oversight required. Most AgentMD runs fall here.
        </li>
        <li>
          <strong>Limited risk</strong> — Deploy, migration, or production changes. Transparency and human-in-the-loop recommended.
        </li>
        <li>
          <strong>High risk</strong> — Critical infrastructure, safety components. Requires risk management, human oversight, and audit trails.
        </li>
      </ul>

      <h2>AgentMD Compliance Features</h2>
      <ul>
        <li>
          <strong>Deterministic workflows</strong> — Commands are explicit and version-controlled in AGENTS.md. No opaque autonomous behavior.
        </li>
        <li>
          <strong>Permission boundaries</strong> — <code>permissions.shell</code> allow/deny lists limit agent scope.
        </li>
        <li>
          <strong>Guardrails</strong> — YAML frontmatter declares constraints (e.g., &quot;Never modify production&quot;).
        </li>
        <li>
          <strong>Human-in-the-loop</strong> — Policy rules with <code>approval: always</code> for sensitive operations.
        </li>
        <li>
          <strong>Audit trails</strong> — Execution history, logs, and audit logs for traceability.
        </li>
        <li>
          <strong>Kill switch</strong> — Cancel running executions from the dashboard.
        </li>
      </ul>

      <h2>Compliance Workflow</h2>
      <ol>
        <li>Classify your agent use case (minimal, limited, or high risk).</li>
        <li>Use <code>permissions.shell.default: deny</code> with explicit allowlists.</li>
        <li>Enable human approval for deploy, migrate, or production changes.</li>
        <li>Review execution history and success rates regularly.</li>
        <li>Export traces via OpenTelemetry for external governance platforms.</li>
      </ol>

      <h2>References</h2>
      <ul>
        <li>
          <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            EU AI Act (Regulation 2024/1689)
          </a>
        </li>
        <li>
          <Link href="/docs/best-practices" className="text-primary hover:underline">
            Agentic AI Best Practices
          </Link>
        </li>
      </ul>
    </div>
  );
}
