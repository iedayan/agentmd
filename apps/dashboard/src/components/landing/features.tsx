export function Features() {
    return (
        <section className="border-b border-border py-24 relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>
            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16 animate-fade-up">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                            Parse · Validate · Execute
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            A complete lifecycle engine for your AI agents, seamlessly integrated into your repository.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto text-center md:text-left">
                        {/* Large Featured Card */}
                        <div className="md:col-span-2 bento-card flex flex-col justify-between items-center md:items-start p-8 md:p-10">
                            <div className="w-full">
                                <h3 className="text-2xl font-bold mb-4">Execute in CI</h3>
                                <p className="text-muted-foreground leading-relaxed md:max-w-md mx-auto md:mx-0">
                                    Run on push, PR, or cron. Results stream back to you in real-time. Catch breaking changes before they hit production and ensure agent reliability.
                                </p>
                            </div>
                            <div className="mt-8 relative h-32 w-full rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden border border-border/50 text-left">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"></div>
                                {/* Mock terminal lines */}
                                <div className="p-4 font-mono text-xs text-muted-foreground/80 flex flex-col gap-2">
                                    <div><span className="text-primary">❯</span> agentmd run validate</div>
                                    <div className="text-green-500/80">✓ Parsed AGENTS.md successfully</div>
                                    <div className="text-green-500/80">✓ 5 tools verified</div>
                                    <div className="text-blue-400">Executing... [10s]</div>
                                </div>
                            </div>
                        </div>

                        {/* Smaller Card 1 */}
                        <div className="bento-card flex flex-col justify-center items-center p-8 md:p-10 text-center">
                            <h3 className="font-bold text-2xl mb-4">Readiness score</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Get a 0–100 score on how agent-ready your repository is based on best practices and tool availability.
                            </p>
                            <div className="mt-8 flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-black text-primary drop-shadow-md">98</span>
                                <span className="text-lg font-medium text-muted-foreground">/100</span>
                            </div>
                        </div>

                        {/* Smaller Card 2 */}
                        <div className="md:col-span-3 bento-card relative overflow-hidden group p-8 md:p-12 text-center">
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
