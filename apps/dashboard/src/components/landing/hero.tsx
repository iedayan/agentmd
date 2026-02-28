import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroCode } from '@/components/landing/hero-code';
import { QuickInstall } from '@/components/landing/quick-install';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative border-b border-border bg-muted/30 overflow-hidden">
      <div className="absolute inset-0 hero-execution-grid"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/95"></div>
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[100px] animate-pulse-glow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[80px] animate-float"></div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-28 z-10">
        <div className="mx-auto max-w-3xl text-center md:text-left">
          <p className="font-mono text-xs tracking-widest uppercase mb-3 sm:mb-4 text-primary animate-fade-up">
            Parse → Validate → Execute
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] animate-fade-up animation-delay-100 drop-shadow-sm text-gradient">
            Your AGENTS.md is the spec.
            <br />
            <span className="text-primary-glow">We execute it.</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto md:mx-0 animate-fade-up animation-delay-200">
            The CI/CD platform for AI agents. Get your agent-readiness score in under 2 minutes—one
            file, no config.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/80 animate-fade-up animation-delay-200">
            <Link href="/docs/why-execute" className="text-primary hover:underline">
              Why execute vs. read-only?
            </Link>
          </p>
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 animate-fade-up animation-delay-300">
            <a href="#try-it" className="inline-flex">
              <Button
                size="lg"
                className="h-11 sm:h-12 gap-2 px-6 sm:px-8 font-semibold rounded-full text-sm sm:text-base"
              >
                Get your score
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-full border-border/80 backdrop-blur-sm bg-background/50 hover:bg-background/80 text-sm sm:text-base"
              >
                Start free
              </Button>
            </Link>
            <Link href="/ops">
              <Button
                size="lg"
                variant="ghost"
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-full text-muted-foreground hover:text-foreground text-sm sm:text-base"
              >
                See it live
              </Button>
            </Link>
          </div>
          <div className="animate-fade-up animation-delay-500">
            <QuickInstall />
            <p className="mt-3 text-xs text-muted-foreground/80">
              No install required · Free for 3 repos · No credit card
            </p>
          </div>
          <div className="mt-10 sm:mt-14 max-w-2xl mx-auto md:mx-0 animate-fade-up animation-delay-500 relative group overflow-x-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-emerald-400/30 rounded-2xl blur-xl opacity-10 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative border-luminescent border-white/20 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <HeroCode />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
