import Link from 'next/link';

export default function WhyAgentmdPage() {
  return (
    <div>
      <h1>Why AgentMD vs. Local Execution</h1>
      <p className="lead">
        Cursor, Codex, and other AI coding tools can run commands locally. So why use AgentMD?
      </p>

      <h2>What Local Execution Lacks</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Need</th>
              <th className="text-left py-3 px-4">Local</th>
              <th className="text-left py-3 px-4">AgentMD</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3 px-4">Team visibility</td>
              <td className="py-3 px-4">Only you see what ran</td>
              <td className="py-3 px-4">Execution history, audit logs</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4">Governance</td>
              <td className="py-3 px-4">Your machine, your rules</td>
              <td className="py-3 px-4">Guardrails, permissions, human-in-the-loop</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4">Compliance</td>
              <td className="py-3 px-4">No audit trail</td>
              <td className="py-3 px-4">Full traceability, EU AI Act alignment</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4">CI/CD</td>
              <td className="py-3 px-4">Manual or custom</td>
              <td className="py-3 px-4">PR checks, webhooks, GitHub Action</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4">Approval workflows</td>
              <td className="py-3 px-4">None</td>
              <td className="py-3 px-4">Slack approvals for deploy, migrate</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>When to Use AgentMD</h2>
      <p>Use AgentMD when you need:</p>
      <ul>
        <li>
          <strong>Team controls</strong> — Multiple developers, shared repos
        </li>
        <li>
          <strong>Audit and compliance</strong> — Regulated industry, SOC2, EU AI Act
        </li>
        <li>
          <strong>CI/CD</strong> — Run AGENTS.md on every PR
        </li>
        <li>
          <strong>Governance</strong> — Guardrails, approval for sensitive ops
        </li>
        <li>
          <strong>Observability</strong> — Success rates, ROI, ops integration
        </li>
      </ul>

      <h2>AgentMD Complements Local Tools</h2>
      <p>
        AgentMD doesn&apos;t replace Cursor or Codex. It runs the spec (AGENTS.md) in a governed
        environment. Your AI tool can still run locally for speed. AgentMD runs the same commands in
        CI and for audit—one source of truth, full traceability.
      </p>

      <p className="mt-8">
        <Link href="/for/ci-cd" className="text-primary hover:underline">
          For CI/CD Teams
        </Link>
        {' · '}
        <Link href="/for/enterprises" className="text-primary hover:underline">
          For Enterprises
        </Link>
      </p>
    </div>
  );
}
