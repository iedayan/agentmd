import Link from 'next/link';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/ui/footer';

export const metadata = {
  title: 'The Problem — AgentMD',
  description:
    'Agent sprawl, governance gaps, and unreliable execution are blocking enterprise AI adoption. See the data.',
};

export default function TheProblemPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-4xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            The Problem We Solve
          </h1>
          <p className="text-muted-foreground text-lg mb-12">
            The problems AgentMD addresses are widely recognized and actively hindering enterprise
            AI adoption.
          </p>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">1. Agent Sprawl & Integration Chaos</h2>
            <p className="text-muted-foreground mb-4">
              Enterprises are drowning in disconnected AI agents. Organizations use an average of{' '}
              <strong>12 agents today</strong>, expected to reach <strong>20 by 2027</strong>. Yet{' '}
              <strong>~50% operate in isolated silos</strong>, and{' '}
              <strong>4 in 5 IT leaders</strong> believe agents will create more complexity than
              value due to integration challenges.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>How AgentMD helps:</strong> One AGENTS.md file, one spec, all compatible
              agents. Unified workflows instead of silos.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">2. The Governance & Control Gap</h2>
            <p className="text-muted-foreground mb-4">
              Only <strong>6%</strong> of organizations have advanced AI security strategies.{' '}
              <strong>60%</strong> have no formal governance framework. <strong>69%</strong> of
              agentic decisions still require human verification—agents aren&apos;t trusted.{' '}
              <strong>100%</strong> of organizations have agentic AI on their roadmap, but
              governance lags far behind.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>How AgentMD helps:</strong> Built-in guardrails, approval workflows, policy
              rules, audit logs. Control, not just observation.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">3. Unreliable Agent Execution</h2>
            <p className="text-muted-foreground mb-4">
              <strong>50%</strong> of agentic AI projects remain in proof-of-concept.{' '}
              <strong>61%</strong> have fragmented logs with no unified audit trail.{' '}
              <strong>77%</strong> cannot trace data provenance. The industry needs systems that
              execute reliably and auditably.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>How AgentMD helps:</strong> We don&apos;t just observe—we{' '}
              <strong>execute</strong> workflows from AGENTS.md. Full traceability, unified logs.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-6 mb-12">
            <h2 className="text-lg font-semibold mb-3">Market validation</h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                AI governance market: <strong>$4.83B by 2034</strong> (35–45% CAGR)
              </li>
              <li>
                <strong>91%</strong> planning to increase agentic AI budgets
              </li>
              <li>
                <strong>85%</strong> believe it will be table stakes within 3 years
              </li>
            </ul>
          </section>

          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-8">
            &ldquo;Monitoring without enforcement leaves organizations exposed when something goes
            wrong.&rdquo;
          </blockquote>

          <p className="text-muted-foreground">
            That&apos;s exactly what AgentMD fixes.{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Get started free
            </Link>
            {' · '}
            <Link href="/docs/why-execute" className="text-primary hover:underline font-medium">
              Why execute vs. read-only
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
