"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch, Play, Share2, Check, Copy } from "lucide-react";

const SAMPLE_AGENTS_MD = `---
name: my-agent
description: Agent instructions for AI coding tools
---

## Build

\`\`\`bash
pnpm run build
\`\`\`

## Test

\`\`\`bash
pnpm run test
\`\`\`

## Lint

\`\`\`bash
pnpm run lint
\`\`\`
`;

type DemoResult = {
  parsed: {
    sections: { title: string; level: number; lineStart: number; lineEnd: number; commandCount: number }[];
    commands: { command: string; section: string; type: string; line: number }[];
    lineCount: number;
    hasFrontmatter: boolean;
  };
  validation: {
    valid: boolean;
    errors: { code: string; message: string; line?: number }[];
    warnings: { code: string; message: string; line?: number }[];
    suggestions: string[];
  };
  score: number;
};

const SAMPLE_README = `# My Project

## Setup

\`\`\`bash
pnpm install
\`\`\`

## Development

\`\`\`bash
pnpm run dev
\`\`\`

## Test

\`\`\`bash
pnpm test
\`\`\`
`;

export function LandingDemo() {
  const [content, setContent] = useState(SAMPLE_AGENTS_MD);
  const [sourceType, setSourceType] = useState<"agentsmd" | "readme">("agentsmd");
  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/demo/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sourceType }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        parsed?: DemoResult["parsed"];
        validation?: DemoResult["validation"];
        score?: number;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Parse failed");
      }
      if (!data.parsed || !data.validation) {
        throw new Error("Invalid response");
      }
      setResult({
        parsed: data.parsed,
        validation: data.validation,
        score: data.score ?? 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [content, sourceType]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [run]);

  return (
    <section id="try-it" className="py-16 sm:py-20 md:py-24 lg:py-32 border-b border-border/50 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center">
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16">
          <span className="inline-block h-1 w-12 rounded-full bg-primary/60 mb-4 sm:mb-6" aria-hidden />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
            Get your agent-readiness score
          </h2>
          <p className="mt-3 sm:mt-4 text-muted-foreground text-base sm:text-lg px-2 sm:px-0">
            Paste your AGENTS.md or README below. No signup required—instant results.
          </p>
        </div>

        <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border/50 bg-muted/50">
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("agentsmd");
                      if (content === SAMPLE_README) setContent(SAMPLE_AGENTS_MD);
                    }}
                    className={`text-xs font-mono px-2 py-1 rounded ${sourceType === "agentsmd" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    AGENTS.md
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("readme");
                      if (content === SAMPLE_AGENTS_MD || content === SAMPLE_README) setContent(SAMPLE_README);
                    }}
                    className={`text-xs font-mono px-2 py-1 rounded ${sourceType === "readme" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    README
                  </button>
                </div>
                <Button size="sm" onClick={run} disabled={loading} className="h-7 text-xs">
                  {loading ? "Parsing…" : "Parse & validate"}
                </Button>
                <span className="text-[10px] text-muted-foreground/70 hidden sm:inline" title="Ctrl+Enter">⌘↵</span>
              </div>
              <textarea
                id="demo-agents-md"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={sourceType === "readme" ? "Paste your README…" : "Paste your AGENTS.md content…"}
                className="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[260px] p-3 sm:p-4 bg-transparent text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/50 resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                spellCheck={false}
                aria-describedby="demo-hint"
              />
            </div>
            <div
              id="demo-hint"
              className="flex items-center justify-between text-xs text-muted-foreground"
            >
              <button
                type="button"
                onClick={() => setContent(sourceType === "agentsmd" ? SAMPLE_AGENTS_MD : SAMPLE_README)}
                className="hover:text-foreground transition-colors"
              >
                Reset to sample
              </button>
              <span>{content.length.toLocaleString()} / 50,000 chars</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card overflow-hidden min-h-[280px] sm:min-h-[320px] shadow-sm">
            <div className="px-4 py-2.5 border-b border-border/50 bg-muted/50">
              <span className="text-xs font-mono text-muted-foreground">Results</span>
            </div>
            <div
              className="p-5 space-y-5 min-h-[280px]"
              aria-live="polite"
              aria-atomic="true"
              aria-busy={loading}
            >
              {loading && <ResultsSkeleton />}
              {error && !loading && <p className="text-sm text-destructive">{error}</p>}
              {!result && !error && !loading && <EmptyState />}
              {result && !loading && (
                <>
                  <div className="flex items-center gap-6">
                    <ScoreRing score={result.score} />
                    <div className="flex-1 w-full text-center sm:text-left">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Agent-readiness score
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tabular-nums text-primary">
                          {result.score}
                        </span>
                        <span className="text-muted-foreground">/ 100</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <ShareButton
                          score={result.score}
                          copied={shareCopied}
                          onCopy={() => {
                            setShareCopied(true);
                            setTimeout(() => setShareCopied(false), 2000);
                          }}
                        />
                        <BadgeCopyButton
                          score={result.score}
                          copied={badgeCopied}
                          onCopy={() => {
                            setBadgeCopied(true);
                            setTimeout(() => setBadgeCopied(false), 2000);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Sections ({result.parsed.sections.length})
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {result.parsed.sections.map((s, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono text-xs">
                            {s.lineStart}–{s.lineEnd}
                          </span>
                          <span className="font-medium">{s.title}</span>
                          {s.commandCount > 0 && (
                            <span className="text-muted-foreground text-xs">
                              ({s.commandCount} cmd{s.commandCount !== 1 ? "s" : ""})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {result.parsed.commands.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Commands ({result.parsed.commands.length})
                      </p>
                      <ul className="space-y-2 text-sm">
                        {result.parsed.commands.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="shrink-0 px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
                              {c.type}
                            </span>
                            <code className="text-foreground/90 break-all text-xs sm:text-sm">{c.command}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Validation
                    </p>
                    <div className="space-y-2 text-sm">
                      {result.validation.valid ? (
                        <p className="text-primary">Valid — no errors</p>
                      ) : (
                        result.validation.errors.map((e, i) => (
                          <p key={i} className="text-destructive">
                            {e.message}
                            {e.line != null && ` (line ${e.line})`}
                          </p>
                        ))
                      )}
                      {result.validation.warnings.length > 0 && (
                        <ul className="space-y-1 text-amber-600 dark:text-amber-500">
                          {result.validation.warnings.map((w, i) => (
                            <li key={i}>
                              {w.message}
                              {w.line != null && ` (line ${w.line})`}
                            </li>
                          ))}
                        </ul>
                      )}
                      {result.validation.suggestions.length > 0 && (
                        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                          {result.validation.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 shadow-sm mb-4">
        <FileSearch className="h-8 w-8 text-primary" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="text-sm font-medium text-foreground">Ready to validate</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-[240px]">
        Click &quot;Parse & validate&quot; to see sections, commands, and your score.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Play className="h-3.5 w-3.5" aria-hidden />
        <span>Paste your AGENTS.md or press Ctrl+Enter to run</span>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-28 bg-muted rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${60 + i * 10}%` }} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + i * 5}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShareButton({
  score,
  copied,
  onCopy,
}: {
  score: number;
  copied: boolean;
  onCopy: () => void;
}) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/share?score=${score}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    onCopy();
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
      {copied ? "Link copied!" : "Share score"}
    </button>
  );
}

function BadgeCopyButton({
  score,
  copied,
  onCopy,
}: {
  score: number;
  copied: boolean;
  onCopy: () => void;
}) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const badgeUrl = `${baseUrl}/api/badge/score?score=${score}`;
  const markdown = `[![AgentMD Score](${badgeUrl})](${baseUrl})`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    onCopy();
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Badge copied!" : "Copy badge"}
    </button>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-20 w-20 shrink-0" aria-hidden>
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/50"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-500"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
    </div>
  );
}
