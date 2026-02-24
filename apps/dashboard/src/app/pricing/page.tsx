import Link from "next/link";
import { Check, Shield, Lock, Activity, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Nav } from "@/components/landing/nav";
import { PricingCards } from "@/components/pricing/pricing-cards";

const PRO_TRIAL_DAYS = 7;

const TRUST_ITEMS = [
  { label: "SOC2 Type II", icon: Shield },
  { label: "GDPR Compliant", icon: Lock },
  { label: "99.9% Uptime SLA", icon: Activity },
];

const FAQ = [
  {
    q: "What counts as an execution minute?",
    a: "Any time an AGENTS.md workflow runs — build, test, deploy, or custom commands. Idle time and parsing don't count.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime. We prorate charges. Downgrades take effect at the next billing cycle.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: `Yes. Start a ${PRO_TRIAL_DAYS}-day free trial of Pro. Cancel anytime before renewal.`,
  },
  {
    q: "What payment methods do you accept?",
    a: "Credit cards (Visa, Mastercard, Amex), and for Enterprise, we can invoice via ACH or wire.",
  },
];

const TAGLINE = "Make Your Repository Agent-Ready";

export default function PricingPage() {
  return (
    <div id="top" className="min-h-screen bg-background">
      <Nav />

      <main role="main">
        {/* Hero */}
        <section className="border-b border-border/50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <span
                className="inline-block h-1 w-12 rounded-full bg-primary/60 mb-6"
                aria-hidden
              />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Transparent Pricing
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                No hidden fees. Cancel anytime. Start free, upgrade when you need more.
              </p>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section
          className="border-b border-border/50 py-8 bg-muted/20"
          aria-label="Trust signals"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {TRUST_ITEMS.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <PricingCards />
            <p className="text-center text-sm text-muted-foreground mt-12 max-w-xl mx-auto">
              All plans include SOC2 Type II, GDPR compliance, and GitHub Actions
              integration. Enterprise: annual contracts with volume discounts.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 border-t border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center gap-2 mb-10">
                <HelpCircle className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="text-2xl font-bold tracking-tight">
                  Frequently asked questions
                </h2>
              </div>
              <dl className="space-y-6">
                {FAQ.map(({ q, a }) => (
                  <div
                    key={q}
                    className="rounded-lg border border-border/60 bg-card p-6"
                  >
                    <dt className="font-semibold text-foreground">{q}</dt>
                    <dd className="mt-2 text-muted-foreground leading-relaxed">
                      {a}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl rounded-xl border border-border/60 bg-gradient-to-b from-primary/8 to-primary/2 p-10 md:p-14 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Not sure which plan?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Start free — no credit card. Upgrade when you need more repos
                or execution time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Link href="/register">
                  <Button size="lg" className="btn-tactile">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/register?plan=pro">
                  <Button size="lg" variant="outline" className="btn-tactile">
                    Start {PRO_TRIAL_DAYS}-Day Pro Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-16">
            <div>
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Logo size="sm" aria-hidden />
                <span className="text-lg">AgentMD</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                {TAGLINE}
              </p>
            </div>
            <nav
              className="flex gap-12 sm:gap-16 border-l-0 md:border-l md:border-border/60 md:pl-16"
              aria-label="Footer navigation"
            >
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Product
                </h4>
                <ul className="space-y-3 text-sm">
                  {[
                    ["Features", "/features"],
                    ["Pricing", "/pricing"],
                    ["Ops", "/ops"],
                    ["Marketplace", "/marketplace"],
                    ["Docs", "/docs"],
                  ].map(([label, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Company
                </h4>
                <ul className="space-y-3 text-sm">
                  {[
                    ["Blog", "/blog"],
                    ["Roadmap", "/roadmap"],
                    ["Status", "/status"],
                    ["Discord", "https://discord.gg/agentmd"],
                  ].map(([label, href]) => (
                    <li key={href}>
                      {href.startsWith("http") ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Legal
                </h4>
                <ul className="space-y-3 text-sm">
                  {[
                    ["Privacy", "/privacy"],
                    ["Terms", "/terms"],
                    ["Cookies", "/cookies"],
                    ["GDPR", "/gdpr"],
                  ].map(([label, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AgentMD. All rights reserved.
            </p>
            <a
              href="#top"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
