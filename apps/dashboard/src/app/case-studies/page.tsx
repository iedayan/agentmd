import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

const CASE_STUDIES = [
  {
    id: "fintech-squad",
    title: "Fintech Squad",
    industry: "Financial Services",
    metric: "40% fewer failed deployments",
    icon: Shield,
    summary:
      "A 12-person fintech team reduced deployment failures by 40% after adopting AgentMD. AGENTS.md enforces deterministic build and test flows, with human approval for production deploys.",
    highlights: [
      "Guardrails prevent direct production changes",
      "Slack approval for deploy steps",
      "Audit trail for compliance reviews",
    ],
  },
  {
    id: "saas-platform",
    title: "SaaS Platform Team",
    industry: "SaaS",
    metric: "12 hrs/month saved on CI triage",
    icon: Zap,
    summary:
      "A platform team running 200+ repos cut manual CI triage from 15 hours to 3 hours per month. AgentMD executes AGENTS.md commands with permission boundaries, surfacing success rates and ROI metrics.",
    highlights: [
      "Execution success rate dashboard",
      "ROI calculator with labor value",
      "Deterministic workflows for reproducibility",
    ],
  },
  {
    id: "agency-multi-repo",
    title: "Agency Multi-Repo",
    industry: "Agency",
    metric: "3x faster onboarding",
    icon: TrendingUp,
    summary:
      "An agency managing 30+ client repos standardized on AGENTS.md. New developers get a single source of truth for build, test, and lint. AgentMD validates and runs across all repos.",
    highlights: [
      "Template gallery for React, Next.js, Python",
      "Agent-readiness score per repo",
      "Unified execution history",
    ],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 hero-dot-grid opacity-[0.4]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-aurora animation-delay-500" />
      </div>

      <div className="container relative mx-auto px-4 py-24 max-w-5xl">
        {/* Header Section with Animation */}
        <div className="mb-16 text-center animate-fade-up">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            Use Case Scenarios
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Case Studies
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Illustrative scenarios showing how teams use AgentMD for governed agent execution. Outcomes are based on typical adoption patterns.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/80 max-w-xl mx-auto">
            Real customer case studies with named organizations will be added as we grow. Contact us if you&apos;d like to share your story.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CASE_STUDIES.map((cs, idx) => (
            <div
              key={cs.id}
              className={`animate-fade-up`}
              style={{ animationDelay: `${(idx + 1) * 150}ms` }}
            >
              <Card className="bento-card h-full flex flex-col border-white/5 bg-transparent p-1 shadow-none hover:shadow-2xl transition-all duration-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bento-icon-wrap">
                      <cs.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{cs.industry}</span>
                  </div>
                  <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                    {cs.title}
                  </CardTitle>
                  <div className="mt-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                    {cs.metric}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-5">
                  <p className="text-sm leading-relaxed text-muted-foreground/90">
                    {cs.summary}
                  </p>

                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50">Key Outcomes</p>
                    <ul className="space-y-2">
                      {cs.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <div className="mt-1.5 h-1 w-1 rounded-full bg-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-20 flex flex-col items-center justify-center gap-6 animate-fade-up animation-delay-500">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard/analytics">
              <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                View ROI Calculator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/docs/best-practices">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                Best Practices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
