import Link from "next/link";
import { AlertTriangle, Shield, Zap } from "lucide-react";

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "Agent sprawl",
    stat: "4 in 5",
    statLabel: "IT leaders fear agents create more complexity than value",
    href: "/docs/the-problem",
  },
  {
    icon: Shield,
    title: "Governance gap",
    stat: "6%",
    statLabel: "have advanced AI security strategies",
    href: "/docs/the-problem",
  },
  {
    icon: Zap,
    title: "Unreliable execution",
    stat: "69%",
    statLabel: "of agentic decisions still require human verification",
    href: "/docs/the-problem",
  },
];

export function TheProblem() {
  return (
    <section className="border-b border-border py-16 sm:py-20 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-block h-1 w-12 rounded-full bg-primary/60 mb-4" aria-hidden />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            The problem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Enterprise AI adoption is blocked by sprawl, governance gaps, and
            untrusted execution. The data backs it.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto">
          {PROBLEMS.map(({ icon: Icon, title, stat, statLabel, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border border-border/60 bg-background p-5 sm:p-6 hover:border-primary/30 hover:bg-muted/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    {title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {stat}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {statLabel}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="text-center mt-8">
          <Link
            href="/docs/the-problem"
            className="text-sm font-medium text-primary hover:underline"
          >
            See the full data and how AgentMD solves it →
          </Link>
        </p>
      </div>
    </section>
  );
}
