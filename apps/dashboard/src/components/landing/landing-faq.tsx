import Link from 'next/link';
import { FaqItem } from '@/components/faq/faq-item';

/** Short Q&A for landing page (4–6 items, scannable). */
const LANDING_FAQ_ITEMS = [
  {
    q: 'What is AGENTS.md?',
    a: 'A standard file that describes how AI agents should work with your repo — commands, tools, and rules. AgentMD parses it and executes it in CI.',
  },
  {
    q: 'How do I get started?',
    a: 'Sign up free, connect GitHub, and add a repo. Run npx @agentmd-dev/cli init to auto-detect your stack. Free tier: 3 repos, no credit card.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. Use the CLI with npx or add our GitHub Action to your workflow. No install or config required.',
  },
  {
    q: 'How does it work with GitHub?',
    a: 'Install the AgentMD GitHub App or use our Action in your workflow. We run AGENTS.md on every push so your spec stays in sync.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. Free for 3 repos and 100 execution minutes per month. No credit card required. Upgrade when you need more.',
  },
];

export function LandingFAQ() {
  return (
    <section className="border-b border-border py-16 sm:py-20 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10">
            <span className="inline-block h-1 w-12 rounded-full bg-primary/60 mb-4" aria-hidden />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Common questions
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Everything you need to know to get started.
            </p>
          </div>
          <div className="space-y-3">
            {LANDING_FAQ_ITEMS.map(({ q, a }) => (
              <FaqItem key={q} question={q} answer={a} />
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link
              href="/faq"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all FAQ →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
