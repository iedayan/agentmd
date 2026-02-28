import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-8 text-center md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Ready to ship with AI?
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
              Get your score, add AGENTS.md, connect the GitHub App. Free for 3 repos—no credit
              card.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-11 px-8 font-semibold shadow-lg shadow-primary/20 gap-2"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#try-it">
                <Button size="lg" variant="outline" className="h-11 px-8">
                  Try your score first
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
