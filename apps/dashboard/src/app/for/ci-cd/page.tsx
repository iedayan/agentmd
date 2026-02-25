import Link from "next/link";
import { Nav } from "@/components/landing/nav";
import { Button } from "@/components/ui/button";
import { Check, GitBranch, Shield, Zap } from "lucide-react";

export default function ForCiCdPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-12">
          <p className="font-mono text-xs tracking-widest uppercase text-primary mb-2">
            For CI/CD Teams
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Run AGENTS.md on every push
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your AGENTS.md is the spec. AgentMD executes it—build, test, lint—with governance and audit trails.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">PR checks that match your spec</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add AgentMD to your CI. Every PR runs the commands from AGENTS.md. No drift between what the spec says and what actually runs.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Governance built in</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Permission boundaries, guardrails, and human-in-the-loop for deploy steps. Execution history and audit logs for compliance.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">One file, one platform</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AGENTS.md is already used by 60k+ repos. AgentMD makes it executable. No new config files—just connect your repo.
              </p>
            </div>
          </div>
        </div>

        <ul className="mt-10 space-y-2 text-sm">
          {[
            "GitHub Action for PR checks",
            "Agent-readiness score per repo",
            "Execution success rates and ROI metrics",
            "Kill switch for running executions",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/register">
            <Button size="lg">Start free</Button>
          </Link>
          <Link href="/docs/quickstart">
            <Button variant="outline" size="lg">Quickstart</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
