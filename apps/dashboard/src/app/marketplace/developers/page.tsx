import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Code2,
  FileCode,
  Shield,
  BarChart3,
  Zap,
  ArrowRight,
} from "lucide-react";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">Developer Tools</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Build, publish, and monetize agents for the AgentMD Marketplace
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DevToolCard
            icon={<FileCode className="h-8 w-8" />}
            title="AGENTS.md Generator"
            description="Generate AGENTS.md for React, Next.js, Python, Rust, and more."
            href="/marketplace/developers/generator"
          />
          <DevToolCard
            icon={<Code2 className="h-8 w-8" />}
            title="Migration Tools"
            description="Convert from CLAUDE.md, .cursorrules, or other formats."
            href="/marketplace/developers/migrate"
          />
          <DevToolCard
            icon={<Shield className="h-8 w-8" />}
            title="Verification Program"
            description="Get Certified AGENTS.md Compatible badge. Security review + benchmarking."
            href="/marketplace/developers/verify"
          />
          <DevToolCard
            icon={<Zap className="h-8 w-8" />}
            title="Testing Sandbox"
            description="Test your agent in isolation before publishing."
            href="/marketplace/developers/sandbox"
          />
          <DevToolCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Seller Analytics"
            description="Usage, revenue, and performance for your marketplace agents."
            href="/dashboard/analytics"
          />
          <DevToolCard
            icon={<Code2 className="h-8 w-8" />}
            title="SDK & API Docs"
            description="REST API for discovery and execution. Webhooks for completion."
            href="/marketplace/developers/docs"
          />
        </div>

        <div className="mt-16 rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold">Skills for Agent Authors</h2>
          <p className="text-muted-foreground mt-2">
            AI assistant skills that help you author and improve AGENTS.md. Install via Cursor, Codex, or Claude Code.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/getsentry/skills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                getsentry/skills (agents-md)
              </a>
              {" — "}
              Generate and manage AGENTS.md files
            </li>
            <li>
              <a
                href="https://github.com/VoltAgent/awesome-agent-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                awesome-agent-skills
              </a>
              {" — "}
              Curated list of 380+ skills: skill-creator, next-best-practices, stripe-best-practices, using-neon, and more
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Skills are curated by their maintainers. Review sources before use.
          </p>
        </div>

        <div className="mt-16 rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold">Monetization Models</h2>
          <p className="text-muted-foreground mt-2">
            15% platform fee. Stripe Connect for automated payouts.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Agent Sellers</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Finished agents for specific tasks. One-time, subscription, or usage-based.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Agent Builders</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Templates and frameworks. Sell scaffolding and boilerplate.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Hybrid</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Free agents with paid upgrades. Freemium model.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DevToolCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="text-primary mb-2">{icon}</div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-sm text-primary flex items-center gap-1">
            Learn more
            <ArrowRight className="h-4 w-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
