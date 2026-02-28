import Link from 'next/link';
import { CodeBlock } from '@/components/docs/code-block';

export default function CLIPage() {
  return (
    <div>
      <h1>CLI Reference</h1>
      <p className="lead">
        The AgentMD CLI parses, validates, and executes AGENTS.md files from the terminal.
      </p>

      <h2>Installation</h2>
      <p>After building the project:</p>
      <CodeBlock>{`pnpm run build:core
pnpm run build:cli
pnpm run agentmd -- validate`}</CodeBlock>

      <h2>Commands</h2>

      <h3>validate [path]</h3>
      <p>Validate AGENTS.md. Exits with code 1 on errors.</p>
      <CodeBlock>{`agentmd validate
agentmd validate ./packages/core`}</CodeBlock>

      <h3>discover [path]</h3>
      <p>
        Find all AGENTS.md files in a directory (including nested). Use <code>--parse</code> to
        parse each.
      </p>
      <CodeBlock>{`agentmd discover .
# Found 3 AGENTS.md file(s):
#   AGENTS.md (root) — 5 commands
#   packages/core/AGENTS.md (depth 1) — 3 commands`}</CodeBlock>

      <h3>parse [path]</h3>
      <p>Parse AGENTS.md and print sections and extracted commands.</p>
      <CodeBlock>{`agentmd parse
# AGENTS.md: 42 lines, 4 sections, 5 commands
# Sections:
#   ## Build
#   ## Test
#   ## PR guidelines
# Extracted commands:
#   [build] pnpm run build (Build, line 8)
#   [test] pnpm test (Test, line 12)`}</CodeBlock>

      <h3>compose [path]</h3>
      <p>
        Build AGENTS.md from fragments (<code>**/agents-md/**/*.md</code>,{' '}
        <code>**/*.agents.md</code>).
      </p>
      <CodeBlock>{`agentmd compose .
# Composed 2 AGENTS.md file(s):
#   AGENTS.md (85 lines)
#   packages/web/AGENTS.md (32 lines)`}</CodeBlock>

      <h3>run [path] [types]</h3>
      <p>
        Execute commands from AGENTS.md. Optional types: build, test, lint, format, install, setup,
        deploy.
      </p>
      <CodeBlock>{`agentmd run .           # Run all commands
agentmd run . test      # Run only test commands
agentmd run . build lint`}</CodeBlock>

      <h3>score [path]</h3>
      <p>Compute agent-readiness score (0–100).</p>
      <CodeBlock>{`agentmd score
# Agent-readiness score: 85/100
# → AGENTS.md is well-structured for agent use.`}</CodeBlock>

      <h2>Path Defaults</h2>
      <p>
        If no path is given, <code>.</code> (current directory) is used. AgentMD looks for{' '}
        <code>AGENTS.md</code> in that path or directory.
      </p>

      <p className="mt-8">
        <Link href="/docs/execution" className="text-primary hover:underline">
          → Execution & Safety
        </Link>
      </p>
    </div>
  );
}
