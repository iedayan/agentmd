import { Shield, Zap, Github } from "lucide-react";

const BADGES = [
  {
    icon: Github,
    label: "60K+ repos",
    sub: "AGENTS.md standard",
  },
  {
    icon: Shield,
    label: "Governance-first",
    sub: "Guardrails & audit",
  },
  {
    icon: Zap,
    label: "2 min setup",
    sub: "No config required",
  },
];

export function TrustBadges() {
  return (
    <section className="border-b border-border/50 py-6 sm:py-8 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {BADGES.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 text-center sm:text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm sm:text-base">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
