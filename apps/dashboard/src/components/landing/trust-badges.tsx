import { Shield, Zap, Github } from 'lucide-react';

const BADGES = [
  {
    icon: Github,
    label: '60K+ repos',
    sub: 'AGENTS.md standard',
  },
  {
    icon: Shield,
    label: 'Governance-first',
    sub: 'Guardrails & audit',
  },
  {
    icon: Zap,
    label: '2 min setup',
    sub: 'No config required',
  },
];

export function TrustBadges() {
  return (
    <section className="border-b border-border/50 py-6 sm:py-8 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 shadow-sm">
                <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm sm:text-base">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
