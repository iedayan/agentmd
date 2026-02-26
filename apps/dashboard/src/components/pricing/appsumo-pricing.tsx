"use client";

import Link from "next/link";
import { Check, Zap, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/core/utils";

const APPSUMO_TIERS = [
  {
    name: "Tier 1",
    price: 69,
    desc: "Solo devs & small projects",
    features: [
      "5 repositories",
      "500 execution min/month",
      "14-day log retention",
      "Parallel execution",
      "Slack/Discord notifications",
      "Priority support",
    ],
    cta: "Get Deal on AppSumo",
    href: "https://appsumo.com/agentmd",
    badge: "Best value",
  },
  {
    name: "Tier 2",
    price: 149,
    desc: "Growing teams",
    features: [
      "15 repositories",
      "2,000 execution min/month",
      "30-day log retention",
      "5 team seats",
      "Everything in Tier 1",
    ],
    cta: "Get Deal on AppSumo",
    href: "https://appsumo.com/agentmd",
    badge: "Most popular",
    highlighted: true,
  },
  {
    name: "Tier 3",
    price: 299,
    desc: "Power users",
    features: [
      "30 repositories",
      "5,000 execution min/month",
      "60-day log retention",
      "10 team seats",
      "Everything in Tier 2",
    ],
    cta: "Get Deal on AppSumo",
    href: "https://appsumo.com/agentmd",
    badge: "Maximum value",
  },
];

export function AppSumoPricing() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-4">
          <Zap className="h-3.5 w-3.5" />
          AppSumo Lifetime Deal — 60-day money-back guarantee
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          One-Time Payment, Lifetime Access
        </h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Get AgentMD at a fraction of the monthly cost. Pay once, use forever.
          Monthly limits reset each billing cycle.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {APPSUMO_TIERS.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "rounded-xl border p-8 transition-all duration-200 flex flex-col",
              tier.highlighted
                ? "border-primary shadow-lg shadow-primary/10 md:scale-[1.02] hover:shadow-xl hover:shadow-primary/15 relative"
                : "border-border hover:border-primary/30 hover:shadow-lg"
            )}
          >
            {tier.badge && (
              <span className="inline-flex items-center gap-1 w-fit rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-4">
                <BadgeCheck className="h-3 w-3" />
                {tier.badge}
              </span>
            )}
            <h3 className="text-xl font-bold">{tier.name}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{tier.desc}</p>
            <div className="mt-6">
              <span className="text-4xl font-bold tabular-nums">${tier.price}</span>
              <span className="text-muted-foreground text-base ml-1">one-time</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a href={tier.href} target="_blank" rel="noopener noreferrer">
                <Button
                  className="w-full btn-tactile"
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>
              </a>
              <p className="text-center text-xs text-muted-foreground mt-2">
                60-day money-back guarantee
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
