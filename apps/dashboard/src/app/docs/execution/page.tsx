import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";

export default function ExecutionPage() {
  return (
    <div>
      <h1>Execution &amp; Safety</h1>
      <p className="lead">
        AgentMD executes commands from AGENTS.md with safety checks and permission boundaries.
      </p>

      <h2>Deterministic Workflows</h2>
      <p>
        AgentMD is built on <strong>deterministic workflows</strong> for governance. Commands are parsed, validated, and run in a defined order with explicit permission checks. Outcomes are reproducible given the same input and environment — making it easier to audit, debug, and comply with regulations. See{" "}
        <Link href="/docs/best-practices" className="text-primary hover:underline">
          Agentic AI Best Practices
        </Link>
        {" "}for the full IBM 2026 guidance.
      </p>

      <h2>Execution Flow</h2>
      <ol>
        <li>Parse AGENTS.md and extract commands</li>
        <li>Check <code>isCommandSafe()</code> — block dangerous patterns</li>
        <li>Check <code>isCommandAllowed(permissions)</code> — enforce frontmatter</li>
        <li>Execute with timeout (default 60s)</li>
        <li>Return result (success, exitCode, stdout, stderr)</li>
      </ol>

      <h2>Blocked Patterns</h2>
      <p>These commands are never executed:</p>
      <ul className="text-sm">
        <li><code>rm -rf /</code>, <code>rm -rf ~/</code>, <code>rm -rf $&#123;...&#125;</code></li>
        <li><code>chmod -R 777</code>, <code>chown -R ... /</code></li>
        <li><code>curl ... | sh</code>, <code>wget ... | bash</code></li>
        <li><code>base64 -d ... | sh</code></li>
        <li><code>eval "..."</code></li>
        <li><code>nc ... -e</code>, <code>ncat ... --exec</code></li>
        <li><code>mkfs.*</code>, <code>dd if=... of=/dev</code></li>
        <li><code>&gt; /etc/</code>, <code>&gt; /usr/</code></li>
        <li><code>sudo su</code>, <code>sudo -i</code>, <code>su -</code>, <code>su root</code> (privilege escalation)</li>
      </ul>

      <h2>Permission Boundaries</h2>
      <p>When YAML frontmatter defines <code>permissions.shell</code>:</p>
      <ul>
        <li><strong>allow</strong> — Only listed commands run (supports <code>*</code> wildcards)</li>
        <li><strong>deny</strong> — Block even if in allow</li>
        <li><strong>default: deny</strong> — Require explicit allow list</li>
      </ul>

      <h2>CLI</h2>
      <CodeBlock>{`agentmd run .           # Run all commands
agentmd run . test      # Run only test-type commands
agentmd run . build lint`}</CodeBlock>

      <h2>Security Best Practices</h2>
      <p>
        AgentMD aligns with agent security principles from the industry: least privilege, explicit allowlists, and defense in depth.
      </p>
      <ul>
        <li>
          <strong>Least privilege</strong> — Use <code>permissions.shell.default: deny</code> and an explicit <code>allow</code> list. Only permit commands the agent actually needs.
        </li>
        <li>
          <strong>Explicit allowlists</strong> — Avoid broad wildcards. Prefer <code>pnpm test</code> over <code>pnpm *</code>.
        </li>
        <li>
          <strong>Human-in-the-loop</strong> — Use policy rules with <code>approval: always</code> for sensitive operations (deploy, migrate, production changes).
        </li>
        <li>
          <strong>Sandboxing</strong> — Use <code>agentmd run . --sandbox</code> for isolated runs. For production, use containerized execution.
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">
        See <a href="https://www.ibm.com/think/topics/ai-agent-security" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AI agent security (IBM)</a> for the full threat landscape and countermeasures.
      </p>

      <h2>Evaluation Metrics</h2>
      <p>
        AgentMD tracks execution outcomes for governance and debugging. Each run returns:
      </p>
      <ul>
        <li><strong>Success/failure</strong> — Exit code and error output</li>
        <li><strong>Duration</strong> — <code>durationMs</code> per command</li>
        <li><strong>Output</strong> — stdout and stderr for audit</li>
      </ul>
      <p>
        The dashboard aggregates execution history, success rates (execution-level and command-level), and audit logs. Planned: OpenTelemetry export for integration with Langfuse, Datadog, and other observability platforms.
      </p>

      <h2>Dashboard Execution Modes</h2>
      <p>
        When you run executions from the dashboard, the worker supports two modes:
      </p>
      <ul>
        <li><strong>Mock</strong> (default) — Simulates execution with fixed step durations and outputs. No repo access. Use for demos or when the worker doesn&apos;t have <code>AGENTMD_REAL_EXECUTION=1</code>.</li>
        <li><strong>Real</strong> — Fetches AGENTS.md from <code>agentsMdUrl</code>, parses commands, clones the repo, and runs them. Requires <code>AGENTMD_REAL_EXECUTION=1</code> on the worker. Only supports public GitHub repos.</li>
      </ul>
      <p>
        The execution detail page shows a badge: <strong>Real execution</strong> or <strong>Mock execution</strong>. See{" "}
        <Link href="https://github.com/iedayan/agentmd/blob/main/deploy/worker/README.md" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          deploy/worker/README.md
        </Link>
        {" "}for worker setup.
      </p>

      <h2>Environment</h2>
      <p>Commands run with <code>shell: true</code> in the repo directory. Environment variables are inherited from the process. For production, consider containerized execution.</p>

      <h2>API</h2>
      <p>Use the Execution API for programmatic runs:</p>
      <CodeBlock>{`POST /api/execute
{
  "agentsMdUrl": "https://.../AGENTS.md",
  "agentId": "pr-labeler",
  "repositoryId": "repo_123"
}`}</CodeBlock>

      <p className="mt-8">
        <Link href="/marketplace/developers/docs" className="text-primary hover:underline">
          → API Reference
        </Link>
      </p>
    </div>
  );
}
