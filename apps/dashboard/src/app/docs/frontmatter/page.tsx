import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";

export default function FrontmatterPage() {
  return (
    <div>
      <h1>YAML Frontmatter</h1>
      <p className="lead">
        AGENTS.md supports optional YAML frontmatter for agent configuration: permissions, guardrails, and metadata.
      </p>

      <h2>Schema</h2>
      <CodeBlock>{`---
agent:
  name: string           # Agent identifier
  purpose: string        # Human-readable purpose
  model: string          # AI model (gpt-4o-mini, claude-3-sonnet)
  triggers: string[]     # pull_request.opened, push, etc.
  permissions:           # Permission boundaries
    shell:
      allow: string[]    # Allowed commands (supports *)
      deny: string[]     # Denied commands
      default: allow|deny
    pull_requests: read|write|none
    issues: read|write|none
  guardrails: string[]   # "Never modify code", "Never merge"
  metadata: Record       # Custom key-value
---`}</CodeBlock>

      <h2>Example</h2>
      <CodeBlock>{`---
agent:
  name: pr-labeler
  purpose: "Apply size labels to PRs"
  model: gpt-4o-mini
  triggers: [pull_request.opened]
  permissions:
    shell:
      allow: ["pnpm test", "pnpm lint"]
      default: deny
  guardrails:
    - "Never modify code, never merge"
---

## Build
\`pnpm run build\`

## Test
\`pnpm test\``}</CodeBlock>

      <h2>Shell Permissions</h2>
      <p>
        When <code>shell.allow</code> is set, only listed commands (or wildcard matches) can execute. When <code>shell.default: deny</code>, any command not in allow is blocked.
      </p>
      <ul>
        <li><code>allow: [&quot;pnpm *&quot;]</code> — Allow any pnpm command</li>
        <li><code>deny: [&quot;rm -rf&quot;]</code> — Block even if otherwise allowed</li>
      </ul>

      <h2>Flat vs Nested</h2>
      <p>Both structures are supported:</p>
      <CodeBlock>{`# Nested
---
agent:
  name: my-agent
---

# Flat (legacy)
---
name: my-agent
---`}</CodeBlock>

      <p className="mt-8">
        <Link href="/docs/execution" className="text-primary hover:underline">
          → Execution & Safety
        </Link>
      </p>
    </div>
  );
}
