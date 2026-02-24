"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/core/utils";

const PRO_TRIAL_DAYS = 7;

const PLANS = [
  {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    desc: "Solo developers & open source",
    features: [
      "3 repositories",
      "100 execution min/month",
      "7-day log retention",
      "Basic validation",
      "Community support",
    ],
    cta: "Create Free Account",
    href: "/register",
    highlighted: false,
    note: "No credit card required. Upgrade anytime.",
  },
  {
    name: "Pro",
    priceMonthly: 40,
    priceYearly: 32,
    desc: "Production teams",
    features: [
      "Unlimited repositories",
      "1000 execution min/month",
      "30-day log retention",
      "Parallel execution",
      "5 team seats",
      "Slack/Discord notifications",
      "Priority support",
    ],
    cta: `Start ${PRO_TRIAL_DAYS}-Day Free Trial`,
    href: "/register?plan=pro",
    highlighted: true,
    note: "No credit card required during trial.",
  },
  {
    name: "Enterprise",
    priceMonthly: 199,
    priceYearly: 159,
    desc: "Large teams & compliance",
    features: [
      "Everything in Pro",
      "Self-hosted option",
      "SSO/SAML",
      "RBAC",
      "Audit logs",
      "99.9% SLA",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@agentmd.io",
    highlighted: false,
    note: "Custom contracts, volume discounts, invoicing.",
  },
];

export function PricingCards() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            !yearly ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          aria-label="Toggle between monthly and yearly billing"
          onClick={() => setYearly(!yearly)}
          className="relative h-7 w-12 rounded-full bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span
            className={cn(
              "absolute top-1 left-1 h-5 w-5 rounded-full bg-primary transition-transform",
              yearly && "translate-x-5"
            )}
          />
        </button>
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            yearly ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Yearly
        </span>
        <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Save 20%
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {PLANS.map((plan) => {
          const priceMonthly = plan.priceMonthly;
          const priceYearlyPerMonth = plan.priceYearly;
          const priceYearlyTotal = plan.priceYearly * 12;
          const isExternal = plan.href.startsWith("http") || plan.href.startsWith("mailto:");
          return (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl border p-8 transition-all duration-200 flex flex-col",
                plan.highlighted
                  ? "border-primary shadow-lg shadow-primary/10 md:scale-[1.02] hover:shadow-xl hover:shadow-primary/15 relative"
                  : "border-border hover:border-primary/30 hover:shadow-lg"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most Popular
                </span>
              )}
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="text-muted-foreground mt-1">{plan.desc}</p>
              <div className="mt-6">
                {plan.priceMonthly === 0 ? (
                  <span className="text-4xl font-bold tabular-nums">$0</span>
                ) : yearly ? (
                  <>
                    <span className="text-4xl font-bold tabular-nums">
                      ${priceYearlyTotal.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-base ml-1">/year</span>
                    <span className="block text-sm text-muted-foreground mt-1">
                      ${priceYearlyPerMonth}/mo billed annually
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold tabular-nums">${priceMonthly}</span>
                    <span className="text-muted-foreground text-base ml-1">/month</span>
                  </>
                )}
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-3">
                {isExternal ? (
                  <a href={plan.href}>
                    <Button
                      className="w-full btn-tactile"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </a>
                ) : (
                  <Link href={plan.href}>
                    <Button
                      className="w-full btn-tactile"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                )}
                {plan.note && (
                  <p className="text-center text-xs text-muted-foreground">
                    {plan.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
