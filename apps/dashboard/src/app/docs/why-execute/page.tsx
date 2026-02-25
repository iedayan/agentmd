import Link from "next/link";

export default function WhyExecutePage() {
  return (
    <div>
      <h1>Why Execute AGENTS.md?</h1>
      <p className="lead">
        Most teams treat AGENTS.md as read-only context—something AI coding tools read. AgentMD executes what AGENTS.md describes.
      </p>

      <h2>The Problem with Read-Only</h2>
      <p>When AGENTS.md is only read:</p>
      <ul>
        <li><strong>No verification</strong> — You can&apos;t prove the commands actually work.</li>
        <li><strong>No enforcement</strong> — Agents might skip steps or drift from the spec.</li>
        <li><strong>No audit trail</strong> — You don&apos;t know what ran, when, or whether it passed.</li>
        <li><strong>No governance</strong> — Sensitive operations happen without guardrails or approval.</li>
      </ul>

      <h2>When Execution Matters</h2>

      <h3>1. CI/CD and PR Checks</h3>
      <p>
        Run AGENTS.md commands on every push or PR. If the spec says &quot;test before merge,&quot; AgentMD enforces it.
      </p>

      <h3>2. Compliance and Audit</h3>
      <p>
        Enterprises need traceability. Execution history, success rates, and audit logs provide it. Deterministic workflows support EU AI Act and similar regulations.
      </p>

      <h3>3. Team Standardization</h3>
      <p>
        One source of truth, one execution platform. Everyone runs the same commands the same way.
      </p>

      <h3>4. Failure Prevention</h3>
      <p>
        Catch broken commands before production. Execution surfaces real outcomes, not assumed ones.
      </p>

      <h2>AgentMD&apos;s Approach</h2>
      <ul>
        <li><strong>Parse</strong> — Extract commands from AGENTS.md</li>
        <li><strong>Validate</strong> — Safety checks and permission boundaries</li>
        <li><strong>Execute</strong> — Run in governed environment with timeout and sandboxing</li>
        <li><strong>Audit</strong> — Log outcomes, success rates, ROI metrics</li>
      </ul>

      <p className="mt-8">
        <Link href="/docs/execution" className="text-primary hover:underline">
          → Execution &amp; Safety
        </Link>
        {" · "}
        <Link href="/for/ci-cd" className="text-primary hover:underline">
          For CI/CD Teams
        </Link>
      </p>
    </div>
  );
}
