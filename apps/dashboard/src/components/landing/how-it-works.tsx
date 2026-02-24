export function HowItWorks() {
    return (
        <section className="border-b border-border py-20 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold tracking-tight mb-12">
                        Agent-ready in three steps. Under a minute.
                    </h2>
                    <div className="relative space-y-0">
                        {/* Step connector line */}
                        <div
                            className="absolute left-[15px] top-8 bottom-8 w-px bg-border"
                            aria-hidden
                        />
                        <div className="relative flex gap-6">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-sm font-medium text-primary">
                                1
                            </span>
                            <div className="pb-10">
                                <h3 className="font-semibold mb-1">Create AGENTS.md</h3>
                                <p className="text-sm text-muted-foreground">
                                    Run <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">agentmd init</code> — auto-detects Node, Python, Rust, or Go. Or add commands manually.
                                </p>
                            </div>
                        </div>
                        <div className="relative flex gap-6">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-sm font-medium text-primary">
                                2
                            </span>
                            <div className="pb-10">
                                <h3 className="font-semibold mb-1">Add to CI</h3>
                                <p className="text-sm text-muted-foreground">
                                    Drop the GitHub Action into your workflow. No install, no config.
                                </p>
                            </div>
                        </div>
                        <div className="relative flex gap-6">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-sm font-medium text-primary">
                                3
                            </span>
                            <div>
                                <h3 className="font-semibold mb-1">Ship with confidence</h3>
                                <p className="text-sm text-muted-foreground">
                                    Every run validated. Every command tracked. No drift.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 rounded-xl border border-border bg-card p-5 shadow-sm">
                        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                            Add to .github/workflows/ci.yml
                        </p>
                        <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-sm text-foreground">
                            {`- uses: agentmd/agentmd/.github/actions/agentmd@main
  with:
    command: validate
    path: .`}
                        </pre>
                    </div>
                </div>
            </div>
        </section>
    );
}
