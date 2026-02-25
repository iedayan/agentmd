import Link from "next/link";

export default function BestPracticesPage() {
  return (
    <div>
      <h1>Agentic AI Best Practices (2026)</h1>
      <p className="lead">
        AgentMD aligns with IBM&apos;s 2026 guidance for agentic AI: observable, adaptive, and accountable systems.
      </p>

      <h2>Agent Lifecycle: Where AgentMD Fits</h2>
      <p>
        IBM describes AgentOps across five phases. AgentMD maps to each:
      </p>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Phase</th>
            <th className="text-left py-2">AgentMD Support</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-2"><strong>Development</strong></td>
            <td className="py-2">AGENTS.md defines objectives and constraints. CLI <code>init</code>, <code>doctor</code>, <code>improve</code> help author and refine the spec.</td>
          </tr>
          <tr className="border-b">
            <td className="py-2"><strong>Testing</strong></td>
            <td className="py-2"><code>agentmd run . --dry-run</code> previews execution. Sandbox mode runs in isolation. Contract validation ensures output quality.</td>
          </tr>
          <tr className="border-b">
            <td className="py-2"><strong>Deploy</strong></td>
            <td className="py-2">Human-in-the-loop for deploy steps. Permission boundaries block unauthorized commands. Kill switch cancels running executions.</td>
          </tr>
          <tr className="border-b">
            <td className="py-2"><strong>Monitoring</strong></td>
            <td className="py-2">Execution history, success rates, command-level pass/fail. OTEL export for Langfuse, Datadog, etc.</td>
          </tr>
          <tr className="border-b">
            <td className="py-2"><strong>Feedback</strong></td>
            <td className="py-2">Use failure data to refine <code>permissions.shell</code> and guardrails. ROI metrics quantify value.</td>
          </tr>
        </tbody>
      </table>

      <h2>Concrete Scenarios</h2>

      <h3>Scenario 1: Agent skips a test step</h3>
      <p>
        <strong>Problem:</strong> An AI coding assistant reads AGENTS.md and runs <code>pnpm build</code> and <code>pnpm lint</code>, but skips <code>pnpm test</code> to save time. A broken test slips into the PR.
      </p>
      <p>
        <strong>Solution:</strong> AgentMD executes the full spec. Every run includes build, test, and lint in a defined order. No step is optional. Execution history shows exactly what ran and whether it passed.
      </p>

      <h3>Scenario 2: Deploy without approval</h3>
      <p>
        <strong>Problem:</strong> An agent is instructed to deploy after tests pass. It does so autonomously—no human review. A misconfiguration reaches production.
      </p>
      <p>
        <strong>Solution:</strong> Use policy rules with <code>approval: always</code> for deploy commands. AgentMD blocks execution until a human approves (e.g., via Slack). Audit logs record who approved and when.
      </p>

      <h3>Scenario 3: Dangerous command in a prompt</h3>
      <p>
        <strong>Problem:</strong> A user (or compromised prompt) asks the agent to run <code>rm -rf /</code> or <code>curl ... | sh</code>. Without guardrails, the agent might comply.
      </p>
      <p>
        <strong>Solution:</strong> AgentMD&apos;s <code>isCommandSafe()</code> blocks dangerous patterns. <code>permissions.shell.default: deny</code> with an explicit allowlist ensures only approved commands run. See{" "}
        <Link href="/docs/execution" className="text-primary hover:underline">
          Execution &amp; Safety
        </Link>
        {" "}for the full blocked-pattern list.
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

      <h2>Further Reading</h2>
      <p>
        Deepen your understanding of agentic AI governance and AgentOps:
      </p>
      <ul>
        <li>
          <a href="https://www.ibm.com/think/topics/agentops" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            IBM: What is AgentOps?
          </a>
          {" "}
          — Lifecycle management, observability, and the three focus areas (OTEL, analytics, AI-powered insights)
        </li>
        <li>
          <a href="https://www.ibm.com/think/insights/ai-agent-governance" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            IBM: AI agent governance
          </a>
          {" "}
          — Autonomy, opacity, bias, security, and navigating uncharted waters
        </li>
        <li>
          <a href="https://www.ibm.com/think/topics/ai-agent-security" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            IBM: AI agent security
          </a>
          {" "}
          — Threat landscape, adversarial attacks, and countermeasures
        </li>
        <li>
          <a href="https://www.ibm.com/think/topics/agentic-ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            IBM: Agentic AI explained
          </a>
          {" "}
          — Techsplainers podcast and key concepts
        </li>
        <li>
          <a href="https://research.ibm.com/blog/ibm-agentops-ai-agents-observability" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            IBM Research: AgentOps for AI agents
          </a>
          {" "}
          — OTEL-based observability and analytics platform
        </li>
      </ul>

      <p className="mt-8">
        <Link href="/docs/agentic-ai" className="text-primary hover:underline">
          ← What is Agentic AI?
        </Link>
        {" · "}
        <Link href="/docs/execution" className="text-primary hover:underline">
          Execution &amp; Safety
        </Link>
      </p>
    </div>
  );
}
