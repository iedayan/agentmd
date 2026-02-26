import Link from "next/link";
import { Zap, Code, Rocket, Terminal, FileCode, Layers, Shield, ArrowRight, BookOpen, BookMarked, DollarSign, CircleHelp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const GUIDES = [
  { title: "The Problem", desc: "Agent sprawl, governance gaps, and why enterprises can't trust execution", href: "/docs/the-problem", icon: AlertTriangle },
  { title: "How It Works", desc: "Plain-language explanation of the core engine", href: "/docs/how-it-works", icon: CircleHelp },
  { title: "Beginner Path", desc: "First-time setup in plain language", href: "/docs/beginner", icon: BookOpen },
  { title: "Quickstart", desc: "AGENTS.md in 5 minutes", href: "/docs/quickstart", icon: Rocket },
  { title: "What is Agentic AI?", desc: "Plain-language primer on agentic AI and governance", href: "/docs/agentic-ai", icon: BookOpen },
  { title: "Parse &amp; Validate", desc: "Validation rules and scoring", href: "/docs/parse", icon: Code },
  { title: "CLI Reference", desc: "All commands with examples", href: "/docs/cli", icon: Terminal },
  { title: "YAML Frontmatter", desc: "Agent config schema", href: "/docs/frontmatter", icon: FileCode },
  { title: "Composition", desc: "Multi-file AGENTS.md", href: "/docs/compose", icon: Layers },
  { title: "Execution &amp; Safety", desc: "Sandboxing and permissions", href: "/docs/execution", icon: Shield },
  { title: "Agentic AI Best Practices", desc: "Observable, adaptive, accountable (IBM 2026)", href: "/docs/best-practices", icon: BookMarked },
  { title: "ROI Methodology", desc: "How the analytics calculator derives value", href: "/docs/roi-methodology", icon: DollarSign },
  { title: "API Reference", desc: "REST API for execution", href: "/marketplace/developers/docs", icon: Zap },
];

export default function DocsOverviewPage() {
  return (
    <div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          AgentMD is the CI/CD platform for AI agents. Parse, validate, and execute AGENTS.md — the standard used by 60k+ repositories.
        </p>
      </div>

      <section>
        <h2>What is AgentMD?</h2>
        <p>
          New to agentic AI?{" "}
          <Link href="/docs/agentic-ai" className="text-primary hover:underline">
            What is Agentic AI?
          </Link>
          {" "}
          — A plain-language primer on autonomous agents and why governance matters.
        </p>
        <p>
          <Link href="/docs/why-execute" className="text-primary hover:underline">
            Why execute AGENTS.md?
          </Link>
          {" "}
          — Most teams treat it as read-only. AgentMD executes it.
        </p>
        <p>
          <a href="https://agents.md" target="_blank" rel="noopener noreferrer">agents.md</a> defines the AGENTS.md format — a README for agents. AgentMD goes further: we <strong>parse</strong> it, <strong>validate</strong> it, and <strong>execute</strong> the commands it describes.
        </p>
        <ul>
          <li><strong>Parse</strong> — Sections, commands, YAML frontmatter, directives</li>
          <li><strong>Validate</strong> — Format, safety, recommended sections</li>
          <li><strong>Execute</strong> — Build, test, lint with permission boundaries</li>
          <li><strong>Score</strong> — 0–100 agent-readiness score</li>
        </ul>
      </section>

      <section>
        <h2>Guides</h2>
        <div className="grid gap-3 sm:grid-cols-2 not-prose">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group flex items-start gap-4 rounded-lg border p-5 hover:border-primary/40 hover:bg-muted/30 transition-all"
            >
              <div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                <g.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: g.title }} />
                <p className="text-sm text-muted-foreground mt-0.5">{g.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>GitHub Quick Start</h2>
        <p>
          Connect your repo in 5 minutes: sign in with GitHub, add a repository, ensure AGENTS.md exists, run your first execution. Install the{" "}
          <Link
            href="/github/install"
            className="text-primary hover:underline"
          >
            GitHub App
          </Link>
          {" "}for repo discovery and webhooks.
        </p>
      </section>

      <section>
        <h2>Template Gallery</h2>
        <p>
          AGENTS.md templates for React, Next.js, Python, Rust, Go, and Java.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Link href="/marketplace/developers/generator">
            <Button variant="outline" size="sm">
              Browse Templates
            </Button>
          </Link>
          <Link href="/case-studies">
            <Button variant="outline" size="sm">
              Case Studies &amp; ROI
            </Button>
          </Link>
          <Link href="/design-system">
            <Button variant="outline" size="sm">
              Design System
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <h2>AI Governance &amp; AgentOps</h2>
        <p>
          AgentMD supports agentic AI governance through guardrails, permissions, and policies. As regulations like the EU AI Act evolve, AgentMD helps you run agents safely and accountably. See{" "}
          <Link href="/docs/best-practices" className="text-primary hover:underline">
            Agentic AI Best Practices
          </Link>
          {" "}for IBM 2026 guidance (observable, adaptive, accountable).
        </p>
        <ul className="space-y-2 mt-4">
          <li>
            <strong>Guardrails</strong> — Declare in YAML frontmatter: &quot;Never modify production&quot;, &quot;Never merge&quot;, etc.
          </li>
          <li>
            <strong>Permissions</strong> — Explicit allowlists for shell commands, pull requests, and other resources.
          </li>
          <li>
            <strong>Policies</strong> — Block, warn, or require approval for agent actions (Ops dashboard).
          </li>
          <li>
            <strong>Audit</strong> — Execution history and audit logs for traceability.
          </li>
        </ul>
        <p className="mt-4">
          <a
            href="https://www.ibm.com/think/topics/agentops"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            AgentOps (IBM)
          </a>
          {" "}
          — Lifecycle management for AI agents (development, testing, monitoring, feedback, governance). AgentMD complements observability tools by focusing on execution and governance. The page also links to the IDC whitepaper on evolving regulations and agentic AI.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a href="https://www.ibm.com/think/insights/ai-agent-governance" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              AI agent governance
            </a>
            {" "}
            — Autonomy, transparency, compliance, and security risks
          </li>
          <li>
            <a href="https://www.ibm.com/think/insights/ai-agent-ethics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              AI agent ethics
            </a>
            {" "}
            — Ethics risks, alignment, and function-calling hallucination
          </li>
          <li>
            <a href="https://www.ibm.com/think/topics/ai-agent-evaluation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              AI agent evaluation
            </a>
            {" "}
            — Metrics, benchmarks, and evaluation process (
            <a href="https://www.ibm.com/think/tutorials/ai-agent-evaluation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              tutorial
            </a>
            )
          </li>
          <li>
            <a href="https://www.ibm.com/think/topics/ai-agent-security" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              AI agent security
            </a>
            {" "}
            — Threat landscape, prompt injection, and best practices
          </li>
          <li>
            <a href="https://www.ibm.com/think/tutorials/human-in-the-loop-ai-agent-langgraph-watsonx-ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Human-in-the-loop tutorial
            </a>
            {" "}
            — LangGraph HITL with static and dynamic interrupts
          </li>
          <li>
            <a href="https://www.ibm.com/think/tutorials/ai-agent-observability-langfuse-watsonx-orchestrate" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              AI agent observability
            </a>
            {" "}
            — Langfuse with watsonx Orchestrate for traces and metrics
          </li>
        </ul>
      </section>

      <section>
        <h2>Recommended Agent Skills</h2>
        <p>
          Agent skills extend AI coding assistants with specialized knowledge. Install these to improve AGENTS.md workflows:
        </p>
        <ul className="space-y-3 mt-4">
          <li>
            <strong>getsentry/agents-md</strong> — Generate and manage AGENTS.md files. Use when creating or editing AGENTS.md.
            <div className="mt-1.5 text-sm text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1.5 inline-block">
              git clone --depth 1 --filter=blob:none --sparse https://github.com/getsentry/skills.git &amp;&amp; cd skills &amp;&amp; git sparse-checkout set plugins/sentry-skills/skills/agents-md &amp;&amp; cp -r plugins/sentry-skills/skills/agents-md ~/.cursor/skills/
            </div>
          </li>
          <li>
            <strong>agentmd/agentmd</strong> — AgentMD CLI execution, validation, and scoring. Use when running agentmd commands, validating AGENTS.md, or computing scores.
            <div className="mt-1.5 text-sm text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1.5 inline-block">
              cp -r skills/agentmd ~/.cursor/skills/
            </div>
            <p className="mt-1 text-xs text-muted-foreground">From repo root. Or clone from GitHub and copy the skills/agentmd folder.</p>
          </li>
        </ul>
        <p className="mt-4">
          <a
            href="https://github.com/VoltAgent/awesome-agent-skills"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            awesome-agent-skills
          </a>
          {" "}
          — Browse 380+ skills from Vercel, Stripe, Sentry, etc. Compatible with Cursor, Codex, Claude Code, and Gemini CLI.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Skills are curated, not audited. Review sources before use.
        </p>
      </section>

      <section>
        <h2>Integrations</h2>
        <p>
          AgentMD integrates with Slack, Jira, and GitHub:
        </p>
        <ul className="space-y-2 mt-4">
          <li>
            <strong>Slack</strong> — Human-in-the-loop approvals. Configure <code>SLACK_SIGNING_SECRET</code> and the Interactivity URL.
          </li>
          <li>
            <strong>Jira</strong> — Post execution status on completion. Set <code>JIRA_WEBHOOK_URL</code> to receive success/failure payloads.
          </li>
          <li>
            <strong>GitHub</strong> — Repository discovery, PR checks, webhook-triggered runs.
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          See <code>docs/INTEGRATIONS.md</code> for setup details.
        </p>
      </section>

      <section>
        <h2>Governance Roadmap</h2>
        <p>
          Planned features to support evolving AI regulations and risk management:
        </p>
        <ul className="space-y-1 mt-4 list-disc pl-6">
          <li>
            <Link href="/docs/eu-ai-act" className="text-primary hover:underline">
              EU AI Act risk classification and compliance workflows
            </Link>
          </li>
          <li>Enhanced traceability and decision audit trails</li>
          <li>Automated risk assessment for agent configurations</li>
          <li>OpenTelemetry export for Langfuse, Datadog, and observability platforms</li>
          <li>Emergency pause / kill switch for running executions</li>
          <li>Integration with external governance platforms</li>
        </ul>
      </section>
    </div>
  );
}
