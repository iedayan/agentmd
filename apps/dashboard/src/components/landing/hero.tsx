import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroCode } from "@/components/landing/hero-code";
import { QuickInstall } from "@/components/landing/quick-install";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative border-b border-border bg-muted/30 overflow-hidden">
            <div className="absolute inset-0 hero-dot-grid opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 mix-blend-multiply"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-float"></div>

            <div className="container relative mx-auto px-4 lg:px-8 py-20 md:py-28 z-10">
                <div className="mx-auto max-w-3xl text-center md:text-left">
                    <p className="font-mono text-xs tracking-widest uppercase mb-4 text-primary animate-fade-up">
                        Is your repo agent-ready?
                    </p>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] animate-fade-up animation-delay-100 drop-shadow-sm">
                        Your AGENTS.md is the spec.
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">We execute it.</span>
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground max-w-xl animate-fade-up animation-delay-200">
                        Get your agent-readiness score. Validate and execute AGENTS.md in CI, on every push. One file, one platform, zero drift.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center md:justify-start gap-4 animate-fade-up animation-delay-300">
                        <Link href="/register">
                            <Button size="lg" className="h-12 gap-2 px-8 font-semibold rounded-full text-base">
                                Start free
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/ops">
                            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-border/80 backdrop-blur-sm bg-background/50 hover:bg-background/80 text-base">
                                See it live
                            </Button>
                        </Link>
                    </div>
                    <div className="animate-fade-up animation-delay-500">
                        <QuickInstall />
                        <p className="mt-3 text-xs text-muted-foreground/80">
                            Free for 3 repos · No credit card
                        </p>
                    </div>
                    <div className="mt-14 max-w-2xl animate-fade-up animation-delay-500 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative">
                            <HeroCode />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
