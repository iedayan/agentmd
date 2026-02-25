import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/docs/code-block";

export default function QuickstartPage() {
  return (
    <div>
      <h1>AGENTS.md in 5 Minutes</h1>
      <p className="lead">
        Create an AGENTS.md file, validate it, and run your first execution.
      </p>

      <h2>1. Install & create AGENTS.md</h2>
      <p>From your repo root, install the CLI and create a sample file:</p>
      <CodeBlock>{`pnpm add -D @agentmd/cli
pnpm exec agentmd init`}</CodeBlock>
      <p>
        Or use the{" "}
        <Link href="/marketplace/developers/generator" className="text-primary hover:underline">
          AGENTS.md Generator
        </Link>
        {" "}to create a template for React, Next.js, Python, Rust, Go, or Java.
      </p>
      <p>Or create <code>AGENTS.md</code> manually:</p>
      <CodeBlock>{`## Build
\`\`\`bash
pnpm install
pnpm run build
\`\`\`

## Test
\`pnpm test\`

## Lint
\`pnpm run lint\``}</CodeBlock>

      <h2>2. Validate</h2>
      <p>Check your file and get a score:</p>
      <CodeBlock>{`agentmd validate
agentmd score`}</CodeBlock>

      <h2>3. Execute</h2>
      <p>Preview with dry-run, then run:</p>
      <CodeBlock>{`agentmd run . --dry-run   # Preview
agentmd run . test       # Run test commands`}</CodeBlock>

      <h2>4. Connect to Dashboard</h2>
      <p>
        Link your GitHub repo to run executions from the dashboard, view success rates, and get ROI metrics.
        Deploying? Use the{" "}
        <Link href="/setup/github-app" className="text-primary hover:underline">
          GitHub App Setup Wizard
        </Link>
        {" "}to generate OAuth and GitHub App URLs and env vars.
      </p>

      <p className="mt-8 flex gap-3">
        <Link href="/dashboard">
          <Button size="sm">Try in Dashboard</Button>
        </Link>
        <Link href="/marketplace/developers/generator">
          <Button variant="outline" size="sm">Generate AGENTS.md</Button>
        </Link>
      </p>
    </div>
  );
}
