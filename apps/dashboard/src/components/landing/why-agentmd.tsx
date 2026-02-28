import Link from 'next/link';
import { FileCode, Shield, Play } from 'lucide-react';

const REASONS = [
  {
    icon: FileCode,
    title: 'One file, one spec',
    desc: 'AGENTS.md is the emerging standard backed by Linux Foundation, OpenAI, and 60K+ repos. We execute it—no lock-in.',
  },
  {
    icon: Shield,
    title: 'Governance built in',
    desc: 'Guardrails, permissions, and audit trails from day one. Catch breaking changes before production.',
  },
  {
    icon: Play,
    title: 'Runs in your CI',
    desc: 'GitHub Actions, push, PR, or cron. Same commands your agents use. Zero drift.',
  },
];

export function WhyAgentMD() {
  return (
    <section className="border-b border-border/50 py-16 sm:py-20 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
          <span className="inline-block h-1 w-12 rounded-full bg-primary/60 mb-4" aria-hidden />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Why AgentMD?</h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            The only platform that executes the AGENTS.md spec. Parse, validate, and run—with
            governance from the start.
          </p>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/60 bg-background p-6 sm:p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/15 shadow-[0_0_24px_-4px_hsl(var(--primary)/0.2)] mb-5">
                <Icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-10">
          <Link
            href="/docs/why-execute"
            className="text-sm font-medium text-primary hover:underline"
          >
            Why execute vs. read-only? →
          </Link>
        </p>
      </div>
    </section>
  );
}
