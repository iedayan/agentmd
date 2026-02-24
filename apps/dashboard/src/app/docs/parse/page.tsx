import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";
import { getPublicAppUrl } from "@/lib/core/public-url";

export default function ParsePage() {
  const baseUrl = getPublicAppUrl();
  return (
    <div>
      <h1>Parse & Validate</h1>
      <p className="lead">
        AgentMD parses AGENTS.md into structured sections and commands, then validates against the standard and best practices.
      </p>

      <h2>What We Parse</h2>
      <ul>
        <li><strong>YAML frontmatter</strong> — Agent config (name, permissions, guardrails)</li>
        <li><strong>Markdown sections</strong> — Headings (# ## ###) with content</li>
        <li><strong>Commands</strong> — Backtick-wrapped, code blocks, run/execute patterns</li>
        <li><strong>Directives</strong> — <code>{"<!-- agents-md: key=value -->"}</code> for composition</li>
      </ul>

      <h2>Validation Rules</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Severity</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EMPTY</td>
            <td>Error</td>
            <td>AGENTS.md must not be empty</td>
          </tr>
          <tr>
            <td>LONG_FILE</td>
            <td>Warning</td>
            <td>Recommended under 150 lines for brevity</td>
          </tr>
          <tr>
            <td>NO_SECTIONS</td>
            <td>Warning</td>
            <td>Add markdown headings for structure</td>
          </tr>
          <tr>
            <td>UNSAFE_COMMAND</td>
            <td>Error</td>
            <td>Dangerous commands (rm -rf /, etc.) are blocked</td>
          </tr>
        </tbody>
      </table>

      <h2>Agent-Readiness Score (0–100)</h2>
      <p>
        The score is based on: content, sections, commands, frontmatter, recommended sections (testing, build, PR), and command safety.
      </p>
      <CodeBlock>{`agentmd score
# Agent-readiness score: 75/100`}</CodeBlock>

      <h2>Badge</h2>
      <p>
        Add an agent-readiness badge to your README. Use the score directly or fetch from GitHub:
      </p>
      <CodeBlock>{`# Static score (e.g. 87)
[![AgentMD Score](${baseUrl}/api/badge/score?score=87)](${baseUrl})

# Dynamic from repo (owner/repo)
[![AgentMD Score](${baseUrl}/api/badge/score?repo=owner/repo)](${baseUrl})`}</CodeBlock>
      <p>
        Optional: <code>?branch=main</code> for non-default branches.
      </p>

      <h2>CLI Usage</h2>
      <CodeBlock>{`# Validate AGENTS.md
agentmd validate [path]

# Parse and show structure
agentmd parse [path]`}</CodeBlock>

      <p className="mt-8">
        <Link href="/docs/cli" className="text-primary hover:underline">
          → CLI Reference
        </Link>
      </p>
    </div>
  );
}
