import Link from 'next/link';
import type { Metadata } from 'next';
import { HelpCircle } from 'lucide-react';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { FaqItem } from '@/components/faq/faq-item';
import { FaqSchema } from '@/components/seo/faq-schema';

const FAQ_ITEMS = [
  {
    category: 'Product',
    items: [
      {
        q: 'What is AgentMD?',
        a: 'AgentMD is the CI/CD control plane for AI agents. It parses, validates, and executes AGENTS.md files — the spec that tells AI coding tools how to work with your repo. Instead of just reading the spec, AgentMD actually runs the commands (build, test, deploy) and gives you an agent-readiness score.',
      },
      {
        q: 'What is AGENTS.md?',
        a: 'AGENTS.md is a standard file format that describes how AI agents should interact with your repository — what commands to run, what tools to use, and what rules to follow. Think of it as a recipe for AI coding tools. AgentMD reads this file and executes it.',
      },
      {
        q: 'Why execute vs. read-only?',
        a: 'Most tools only read AGENTS.md. AgentMD actually runs the steps and verifies they work. That means consistent behavior, real validation, and a clear record of what ran. See our docs for a deeper explanation.',
      },
    ],
  },
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I get started?',
        a: 'Sign up for free, connect your GitHub, and add your first repo. Run agentmd init to auto-detect your stack (Node, Python, Rust, Go) or add commands manually. Free tier includes 3 repos and 100 execution minutes per month.',
      },
      {
        q: 'Do I need a credit card?',
        a: "No. The free tier doesn't require a credit card. You can upgrade to Pro when you need more repos or execution time.",
      },
      {
        q: 'What languages and frameworks are supported?',
        a: 'AgentMD works with any stack. We auto-detect Node.js, Python, Rust, and Go. You can also define custom commands in your AGENTS.md for any toolchain.',
      },
    ],
  },
  {
    category: 'Integration',
    items: [
      {
        q: 'How does it work with GitHub?',
        a: "AgentMD integrates via the GitHub App. Install it on your org or personal account, grant access to repos, and we'll run AGENTS.md on every push (or on a schedule). We also offer a GitHub Action for custom workflows.",
      },
      {
        q: 'Can I use it in CI/CD?',
        a: 'Yes. AgentMD is built for CI/CD. Run it in GitHub Actions, or use our hosted execution. We validate and execute AGENTS.md on every push so your spec stays in sync with reality.',
      },
      {
        q: 'Is there a self-hosted option?',
        a: 'Yes. Enterprise plans include a self-hosted option for teams that need to keep everything on-premises.',
      },
    ],
  },
  {
    category: 'Pricing',
    items: [
      {
        q: 'What counts as an execution minute?',
        a: "Any time an AGENTS.md workflow runs — build, test, deploy, or custom commands. Idle time and parsing don't count.",
      },
      {
        q: 'Can I switch plans later?',
        a: 'Yes. Upgrade or downgrade anytime. We prorate charges. Downgrades take effect at the next billing cycle.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'Credit cards (Visa, Mastercard, Amex). For Enterprise, we can invoice via ACH or wire.',
      },
    ],
  },
  {
    category: 'Security & Compliance',
    items: [
      {
        q: 'Is it safe to run commands from AGENTS.md?',
        a: 'AgentMD blocks obviously dangerous commands (e.g. rm -rf /) and supports allowlists. You can run in Dry Run mode to see what would happen without executing. See our docs for security details.',
      },
      {
        q: 'How is my data protected?',
        a: "We use GitHub OAuth for auth. Repos and execution history are isolated per account. All traffic is encrypted (HTTPS). We're SOC2 Type II and GDPR compliant.",
      },
      {
        q: 'What about EU AI Act compliance?',
        a: 'We provide guidance on EU AI Act compliance for AGENTS.md workflows. See our docs for details.',
      },
    ],
  },
];

export const metadata: Metadata = {
  title: 'FAQ — AgentMD',
  description:
    'Frequently asked questions about AgentMD: AGENTS.md execution, pricing, integration, security, and getting started.',
  keywords: ['AgentMD FAQ', 'AGENTS.md', 'agentic AI', 'agent execution', 'agent governance'],
};

const allFaqItems = FAQ_ITEMS.flatMap((g) => g.items);

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <FaqSchema items={allFaqItems.map((i) => ({ question: i.q, answer: i.a }))} />
      <Nav />

      <main role="main">
        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-6 w-6 text-primary" aria-hidden />
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Frequently asked questions
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about AgentMD. Can&apos;t find an answer?{' '}
                <Link href="/docs" className="text-primary hover:underline">
                  Check the docs
                </Link>{' '}
                or{' '}
                <a href="mailto:support@agentmd.online" className="text-primary hover:underline">
                  contact us
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-12">
              {FAQ_ITEMS.map(({ category, items }) => (
                <div key={category}>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <FaqItem
                        key={item.q}
                        question={item.q}
                        answer={item.a}
                        defaultOpen={category === 'Product' && i === 0}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight">Still have questions?</h2>
              <p className="mt-3 text-muted-foreground">
                Start free and explore. No credit card required.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="btn-tactile">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="btn-tactile">
                    Read the Docs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
