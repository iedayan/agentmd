import Link from "next/link";
import { Nav } from "@/components/landing/nav";
import { Button } from "@/components/ui/button";
import { Check, FileCheck, Lock, BarChart3 } from "lucide-react";

export default function ForEnterprisesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-12">
          <p className="font-mono text-xs tracking-widest uppercase text-primary mb-2">
            For Enterprises
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Governed agent execution
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Deterministic workflows, audit trails, and compliance-ready execution for AI agents.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Deterministic workflows</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Commands are explicit and version-controlled in AGENTS.md. No opaque autonomous behavior. Same input, same outcome—auditable and reproducible.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">EU AI Act alignment</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Risk classification, human-in-the-loop, guardrails, and kill switch. Built for evolving regulations.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Full traceability</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Execution history, audit logs, success rates, and ROI metrics. Export traces via OpenTelemetry for your observability stack.
              </p>
            </div>
          </div>
        </div>

        <ul className="mt-10 space-y-2 text-sm">
          {[
            "Self-hosted option",
            "SSO/SAML, RBAC",
            "Slack approvals for sensitive ops",
            "Jira integration for execution status",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/dashboard/enterprise">
            <Button size="lg">Enterprise</Button>
          </Link>
          <Link href="/docs/eu-ai-act">
            <Button variant="outline" size="lg">EU AI Act</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
