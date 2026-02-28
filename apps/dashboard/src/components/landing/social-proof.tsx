'use client';

import { Star, Shield } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function SocialProof() {
  const [stats, setStats] = useState<{ average: number | null; count: number } | null>(null);

  useEffect(() => {
    fetch('/api/reviews?limit=1')
      .then((r) => r.json())
      .then((d: { average?: number | null; count?: number }) => {
        const count = typeof d.count === 'number' ? d.count : 0;
        const average = typeof d.average === 'number' ? d.average : null;
        setStats({ average, count });
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="border-b border-border bg-muted/20 py-4 sm:py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10">
          {stats ? (
            stats.count > 0 && stats.average != null ? (
              <Link
                href="/review"
                className="group inline-flex items-center gap-2.5 rounded-lg border border-border/50 bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-sm"
              >
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform group-hover:scale-110" />
                {stats.average.toFixed(1)}★ from {stats.count} review{stats.count !== 1 ? 's' : ''}
              </Link>
            ) : (
              <Link
                href="/review"
                className="group inline-flex items-center gap-2.5 rounded-lg border border-border/50 bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-sm"
              >
                <Star className="h-4 w-4 transition-transform group-hover:scale-110" />
                Be the first to review
              </Link>
            )
          ) : null}
          <a
            href="https://github.com/iedayan/agentmd"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-lg border border-border/50 bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-sm"
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform group-hover:scale-110" />
            Open source on GitHub
          </a>
          <span className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Shield className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
            </span>
            SOC2 · GDPR compliant
          </span>
          <span className="hidden sm:inline-flex h-4 w-px bg-border" aria-hidden />
          <span className="text-sm text-muted-foreground">Built for teams who ship with AI</span>
        </div>
      </div>
    </div>
  );
}
