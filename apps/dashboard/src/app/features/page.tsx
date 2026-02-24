import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/landing/nav";

const COMPARISON = [
  { feature: "Parse & validate AGENTS.md", agentmd: true, agentops: true },
  { feature: "Execute commands from AGENTS.md", agentmd: true, agentops: false },
  { feature: "Agent-readiness score", agentmd: true, agentops: false },
  { feature: "Execution history & logs", agentmd: true, agentops: false },
  { feature: "Session observability", agentmd: false, agentops: true },
  { feature: "LLM call tracing", agentmd: false, agentops: true },
  { feature: "Marketplace for agents", agentmd: true, agentops: false },
  { feature: "Self-hosted option", agentmd: true, agentops: false },
  { feature: "Human-in-the-loop workflows", agentmd: true, agentops: false },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">AgentMD vs AgentOps</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            AgentOps observes. AgentMD orchestrates and executes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full max-w-4xl mx-auto border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-medium">Feature</th>
                <th className="text-center py-4 px-4 font-medium">AgentMD</th>
                <th className="text-center py-4 px-4 font-medium">AgentOps</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-border/50">
                  <td className="py-4 px-4">{row.feature}</td>
                  <td className="py-4 px-4 text-center">
                    {row.agentmd ? (
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {row.agentops ? (
                      <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 text-center">
          <Link href="/dashboard">
            <Button size="lg" className="btn-tactile">Try AgentMD Free</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
