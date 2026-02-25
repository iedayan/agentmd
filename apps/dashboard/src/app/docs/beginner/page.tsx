import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/docs/code-block";

export default function BeginnerDocsPage() {
  return (
    <div>
      <h1>Beginner Path</h1>
      <p className="lead">
        New to AgentMD? Follow these 3 steps to get your first useful result.
      </p>

      <h2>What AgentMD does (in plain English)</h2>
      <p>
        AgentMD reads your <code>AGENTS.md</code> file, checks it for safety, and runs the commands
        you listed (like build, test, and lint).
      </p>

      <h2>Step 1: Create AGENTS.md</h2>
      <p>From your project folder — no install required:</p>
      <CodeBlock>{`npx @agentmd/cli init`}</CodeBlock>
      <p className="text-sm text-muted-foreground mt-2">
        Or with pnpm: <code>pnpm add -D @agentmd/cli && pnpm exec agentmd init</code>
      </p>

      <h2>Step 2: Validate before running</h2>
      <p>Make sure your instructions are safe and structured:</p>
      <CodeBlock>{`npx @agentmd/cli validate
npx @agentmd/cli score`}</CodeBlock>

      <h2>Step 3: Preview, then run</h2>
      <p>Dry-run first. Then run only test commands:</p>
      <CodeBlock>{`npx @agentmd/cli run . --dry-run
npx @agentmd/cli run . test`}</CodeBlock>

      <h2>If a command is blocked</h2>
      <p>
        By default, AgentMD uses safe execution mode. If your command needs shell operators like
        pipes (<code>|</code>) or redirects, rerun with:
      </p>
      <CodeBlock>{`npx @agentmd/cli run . --use-shell`}</CodeBlock>

      <h2>Minimal AGENTS.md example</h2>
      <CodeBlock>{`## Build
\`pnpm run build\`

## Test
\`pnpm test\`

## Lint
\`pnpm run lint\``}</CodeBlock>

      <p className="mt-8 flex gap-3">
        <Link href="/docs/quickstart">
          <Button size="sm">Go to Quickstart</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Open Dashboard
          </Button>
        </Link>
      </p>
    </div>
  );
}
