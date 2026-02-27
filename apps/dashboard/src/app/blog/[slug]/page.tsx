import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { Logo } from "@/components/brand/logo";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { buildOgUrl } from "@/lib/og";
import { notFound } from "next/navigation";

const POSTS: Record<string, { title: string; date: string; content: string }> = {
  "agentmd-and-ai-governance": {
    title: "AgentMD and AI Governance",
    date: "2025-02-21",
    content: `
## Why governance matters for agentic AI

Agentic AI systems can autonomously chain tasks, make decisions, and execute actions. That autonomy creates value—but also risk. As [IDC research](https://www.ibm.com/think/topics/agentops) notes, agentic workflows that change customer files, approve loans, or rate candidates can make mistakes with real consequences. Regulations like the EU AI Act are evolving to address these risks.

AgentMD is built for **governed execution**. We don't just watch what agents do—we run what they're *supposed* to do, with guardrails and permissions enforced at runtime.

## How AgentMD supports governance

**Guardrails** — Declare constraints in YAML frontmatter. Examples: "Never modify production config", "Never merge without review", "Never access customer PII". AgentMD validates and enforces these at execution time.

**Permissions** — Explicit allowlists for shell commands, pull requests, and other resources. Default-deny with opt-in for specific commands. No more unbounded agent access.

**Policies** — In the Ops dashboard, define policy rules that block, warn, or require approval for agent actions. Scope by agent, repository, or workflow.

**Audit** — Full execution history and audit logs. Traceability for compliance and debugging.

## Risk management in practice

- **Sandboxed execution** — Commands run in isolated environments with permission boundaries
- **Output contracts** — Define expected schema and quality gates; validate before completion
- **Human-in-the-loop** — Require approval for sensitive operations

## Roadmap

We're planning features to support evolving regulations: EU AI Act risk classification, enhanced traceability, automated risk assessment, and integrations with governance platforms. See the [Governance Roadmap](/docs) in our docs.

## Learn more

- [AgentOps (IBM)](https://www.ibm.com/think/topics/agentops) — Lifecycle management for AI agents; includes the IDC whitepaper on AI governance and agentic AI
    `.trim(),
  },
  "agents-md-best-practices": {
    title: "AGENTS.md Best Practices",
    date: "2024-02-20",
    content: `
## Structure your AGENTS.md for clarity

Use clear section headings: ## Build, ## Test, ## Lint. AI tools and AgentMD parse these to extract commands.

## Add executable commands

Wrap commands in backticks: \`pnpm test\`. Use code blocks for multi-line:

\`\`\`bash
pnpm install
pnpm run build
\`\`\`

## Use YAML frontmatter

Add agent metadata at the top:

\`\`\`yaml
---
name: my-agent
triggers: [push, pull_request]
guardrails:
  - Never modify production config
---
\`\`\`

## Keep it concise

Aim for under 150 lines. Link to detailed docs for complex instructions.
    `.trim(),
  },
  "migrating-from-claude-md": {
    title: "Migrating from CLAUDE.md to AGENTS.md",
    date: "2024-02-18",
    content: `
## Why migrate?

AGENTS.md is the emerging standard (60k+ repos). AgentMD parses, validates, and executes it.

## Key differences

- **CLAUDE.md**: Claude-specific, prose-heavy
- **AGENTS.md**: Tool-agnostic, section-based, executable

## Migration steps

1. Copy your CLAUDE.md content
2. Add ## headings for each major section
3. Extract commands into backticks or code blocks
4. Add frontmatter for triggers and guardrails
5. Run \`agentmd validate\` to check

## Example

Before (CLAUDE.md): "To run tests, use pnpm test"
After (AGENTS.md): \`\`\`## Test\n\`pnpm test\`\`\`\`
    `.trim(),
  },
  "case-study-monorepo": {
    title: "Case Study: Scaling AGENTS.md in a Monorepo",
    date: "2024-02-15",
    content: `
## The challenge

Monorepos have multiple packages. Each may need its own AGENTS.md.

## Solution: Composition

Use AgentMD's compose feature with \`**/agents-md/**/*.md\` fragments.

\`\`\`
packages/
  core/agents-md/build.md
  web/agents-md/test.md
\`\`\`

## Directives

\`<!-- agents-md: target=nearest -->\` — compose into each package dir
\`<!-- agents-md: target=root -->\` — single root AGENTS.md

## Result

One \`agentmd compose .\` generates AGENTS.md files per package.
    `.trim(),
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return {};
  const title = `${post.title} | AgentMD Blog`;
  const description = post.content.slice(0, 160).replace(/\n/g, " ").trim() + "...";
  const ogUrl = buildOgUrl({ title: post.title, description, site: "agentmd.online" });
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Logo size="md" />
            AgentMD
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/docs"><Button variant="ghost">Docs</Button></Link>
            <Link href="/dashboard"><Button>Dashboard</Button></Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-6">
          <BackLink href="/blog">Back to Blog</BackLink>
        </div>
        <h1 className="text-4xl font-bold">{post.title}</h1>
        <p className="mt-2 text-muted-foreground">{post.date}</p>
        <div className="mt-12">
          <MarkdownContent content={post.content} />
        </div>
      </main>
    </div>
  );
}
