import { CheckCircle } from "lucide-react";

export function Features() {
    return (
        <section className="border-b border-border py-16 sm:py-20 md:py-24 relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>
            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16 animate-fade-up">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-gradient">
                            Parse · Validate · Execute
                        </h2>
                        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                            A complete lifecycle engine for your AI agents, seamlessly integrated into your repository via <span className="text-foreground font-semibold">Agentic UX</span>.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto text-center md:text-left">
                        {/* Large Featured Card */}
                        <div className="md:col-span-2 bento-card border-luminescent flex flex-col justify-between items-center md:items-start p-8 md:p-10">
                            <div className="w-full">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Execute in CI
                                </h3>
                                <p className="text-muted-foreground leading-relaxed md:max-w-md mx-auto md:mx-0">
                                    Run on push, PR, or cron. Results stream back via <span className="text-primary font-medium">Chain of Thought</span> logs. Catch breaking changes before they hit production.
                                </p>
                            </div>
                            <div className="mt-8 relative h-32 w-full rounded-2xl bg-black/5 dark:bg-white/5 overflow-hidden border border-border/40 text-left">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-beam"></div>
                                {/* Mock terminal lines */}
                                <div className="p-5 font-mono text-xs text-muted-foreground/90 flex flex-col gap-2 relative">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary/60">❯</span>
                                        <span>agentmd run validate</span>
                                        <span className="h-1 w-1 rounded-full bg-primary animate-thought-pulse" />
                                    </div>
                                    <div className="text-emerald-500/90 flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Parsed AGENTS.md successfully</span>
                                    </div>
                                    <div className="text-blue-400 font-medium animate-pulse ml-5">Executing reasoning chain... [10s]</div>
                                </div>
                            </div>
                        </div>

                        {/* Smaller Card 1 */}
                        <div className="bento-card border-luminescent flex flex-col justify-center items-center p-6 sm:p-8 md:p-10 text-center">
                            <h3 className="font-bold text-2xl mb-4">Readiness score</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Get a 0–100 score on how agent-ready your repository is.
                            </p>
                            <div className="mt-8 flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-black text-primary text-primary-glow animate-fade-in">98</span>
                                <span className="text-lg font-medium text-muted-foreground opacity-50">/100</span>
                            </div>
                        </div>

                        {/* Smaller Card 2 */}
                        <div className="md:col-span-3 bento-card relative overflow-hidden group p-6 sm:p-8 md:p-12 text-center">
                            <div className="flex flex-col items-center justify-center h-full">
                                <h3 className="font-bold text-2xl mb-4">Parse & validate</h3>
                                <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                                    Extract sections and commands directly from your <code className="text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">AGENTS.md</code> file. Surface errors and syntax issues immediately in our dashboard before CI runs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
