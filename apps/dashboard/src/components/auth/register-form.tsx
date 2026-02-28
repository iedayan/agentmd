'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Github, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/core/utils';

const PRO_TRIAL_DAYS = 7;

const PLAN_META = {
  pro: {
    badge: `${PRO_TRIAL_DAYS}-Day Free Trial`,
    headline: 'Start your Pro trial',
    sub: `Full Pro access for ${PRO_TRIAL_DAYS} days. No credit card required. Cancel anytime.`,
    highlight: true,
  },
  enterprise: {
    badge: 'Enterprise',
    headline: 'Talk to our team',
    sub: "We'll set up a custom plan, SSO, and onboarding for your organization.",
    highlight: false,
  },
  free: {
    badge: null,
    headline: 'Create your free account',
    sub: '3 repos, 100 execution minutes/month, no credit card needed.',
    highlight: false,
  },
} as const;

type PlanKey = keyof typeof PLAN_META;

export function RegisterForm({ mode = 'register' }: { mode?: 'register' | 'login' }) {
  const [oauthLoading, setOauthLoading] = useState(false);
  const params = useSearchParams();
  const planParam = params.get('plan') as PlanKey | null;
  const plan: PlanKey = planParam && planParam in PLAN_META ? planParam : 'free';
  const meta = PLAN_META[plan];
  const isLogin = mode === 'login';

  const handleOAuth = () => {
    setOauthLoading(true);
    void signIn('github', {
      callbackUrl: plan !== 'free' ? `/dashboard?plan=${plan}` : '/dashboard',
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" />
          <span className="text-xl font-bold tracking-tight">AgentMD</span>
        </Link>
      </div>

      <div
        className={cn(
          'rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-lg',
          meta.highlight && 'border-violet-500/30 shadow-violet-500/10 shadow-xl',
        )}
      >
        {/* Plan badge */}
        {meta.badge && (
          <div className="mb-5 flex justify-center">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {meta.badge}
            </span>
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight text-center">
          {isLogin ? 'Sign in to your account' : meta.headline}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {isLogin ? 'Use your GitHub account to continue.' : meta.sub}
        </p>

        {/* OAuth */}
        <div className="mt-8 space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2 font-medium"
            disabled={oauthLoading}
            onClick={handleOAuth}
          >
            {oauthLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Github className="h-4 w-4" />
                {isLogin ? 'Sign in with GitHub' : 'Continue with GitHub'}
              </>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email sign-in status */}
        <div className="space-y-4 rounded-lg border border-dashed border-border/60 bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Email login is currently disabled for security and provisioning consistency. Use GitHub
            sign-in.
          </p>
        </div>

        {/* Fine print */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          By signing up you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* What happens after */}
      <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          What happens next
        </p>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-mono text-primary font-bold">1.</span>
            Connect a repo — paste owner/repo and hit Add
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-primary font-bold">2.</span>
            We find or create AGENTS.md — no config needed
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-primary font-bold">3.</span>
            First run in under 2 minutes
          </li>
          {plan === 'pro' && (
            <li className="flex gap-2">
              <span className="font-mono text-primary font-bold">4.</span>
              After {PRO_TRIAL_DAYS} days, add a card to keep Pro — or stay on Free
            </li>
          )}
        </ol>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
