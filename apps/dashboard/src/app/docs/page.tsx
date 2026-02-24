import Link from "next/link";
import { Zap, Code, Rocket, Terminal, FileCode, Layers, Shield, ArrowRight, BookOpen, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";

const GUIDES = [
  { title: "Beginner Path", desc: "First-time setup in plain language", href: "/docs/beginner", icon: BookOpen },
  { title: "Quickstart", desc: "AGENTS.md in 5 minutes", href: "/docs/quickstart", icon: Rocket },
  { title: "Parse &amp; Validate", desc: "Validation rules and scoring", href: "/docs/parse", icon: Code },
  { title: "CLI Reference", desc: "All commands with examples", href: "/docs/cli", icon: Terminal },
  { title: "YAML Frontmatter", desc: "Agent config schema", href: "/docs/frontmatter", icon: FileCode },
  { title: "Composition", desc: "Multi-file AGENTS.md", href: "/docs/compose", icon: Layers },
  { title: "Execution &amp; Safety", desc: "Sandboxing and permissions", href: "/docs/execution", icon: Shield },
  { title: "Agentic AI Best Practices", desc: "Observable, adaptive, accountable (IBM 2026)", href: "/docs/best-practices", icon: BookMarked },
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
        <h2>Ecosystem &amp; Related Resources</h2>
        <p>
          AgentMD runs AGENTS.md files. These resources help you author, migrate, and extend agent instructions.
        </p>
        <ul className="space-y-2 mt-4">
          <li>
            <a
              href="https://github.com/VoltAgent/awesome-agent-skills"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              awesome-agent-skills
            </a>
            {" "}
            — Curated collection of 380+ agent skills from official dev teams (Vercel, Stripe, Sentry, etc.), compatible with Cursor, Codex, Claude Code, and Gemini CLI.
          </li>
          <li>
            <a
              href="https://github.com/getsentry/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              getsentry/skills (agents-md)
            </a>
            {" "}
            — Skill for generating and managing AGENTS.md files. Use it in Cursor or Claude to help create and maintain AGENTS.md.
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
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
