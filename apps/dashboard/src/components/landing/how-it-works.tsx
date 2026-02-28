"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";

const WORKFLOW_SNIPPET = `- uses: iedayan/agentmd/.github/actions/agentmd@7f23caa9a688230815368fc07716828884479cad
  with:
    command: validate
    path: .`;

export function HowItWorks() {
    const [copied, setCopied] = useState(false);

    const copyWorkflow = async () => {
        await navigator.clipboard.writeText(WORKFLOW_SNIPPET);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="border-b border-border py-16 sm:py-20 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-8 sm:mb-12">
                        <span className="inline-block h-1 w-12 rounded-full bg-primary/60 mb-4" aria-hidden />
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                            How to get started
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Agent-ready in three steps. Under a minute.
                        </p>
                    </div>
                    <div className="relative space-y-0">
                        {/* Step connector line */}
                        <div
                            className="absolute left-[17px] top-9 bottom-9 w-px bg-gradient-to-b from-primary/30 via-border to-primary/30"
                            aria-hidden
                        />
                        <div className="relative flex gap-6">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 ring-1 ring-primary/20 font-mono text-sm font-semibold text-primary shadow-sm">
                                1
                            </span>
                            <div className="pb-10">
                                <h3 className="font-semibold mb-1">Create AGENTS.md</h3>
                                <p className="text-sm text-muted-foreground">
                                    Run <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npx @agentmd-dev/cli init</code> — auto-detects Node, Python, Rust, or Go. No install.
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
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 ring-1 ring-primary/20 font-mono text-sm font-semibold text-primary shadow-sm">
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
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                Add to .github/workflows/ci.yml
                            </p>
                            <button
                                type="button"
                                onClick={copyWorkflow}
                                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <CodeBlock label=".github/workflows/ci.yml">
                            {WORKFLOW_SNIPPET}
                        </CodeBlock>
                    </div>
                </div>
            </div>
        </section>
    );
}
