import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Agent-ready leaderboard | AgentMD",
  description: "Top agent-ready repositories",
};

const FEATURED_REPOS = [
  { owner: "agentmd", repo: "agentmd", score: 92, language: "TypeScript" },
  { owner: "vercel", repo: "next.js", score: 88, language: "TypeScript" },
  { owner: "facebook", repo: "react", score: 85, language: "JavaScript" },
  { owner: "microsoft", repo: "TypeScript", score: 84, language: "TypeScript" },
  { owner: "langchain-ai", repo: "langchain", score: 82, language: "Python" },
  { owner: "openai", repo: "openai-python", score: 80, language: "Python" },
  { owner: "anthropics", repo: "anthropic-sdk-typescript", score: 78, language: "TypeScript" },
  { owner: "trpc", repo: "trpc", score: 76, language: "TypeScript" },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo size="sm" />
            AgentMD
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground">
              Docs
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Agent-ready leaderboard
          </h1>
          <p className="mt-4 text-muted-foreground">
            Top repositories by agent-readiness score. Is yours on the list?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 text-primary hover:underline font-medium"
          >
            Get your score →
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span className="col-span-1">#</span>
              <span className="col-span-6">Repository</span>
              <span className="col-span-3">Language</span>
              <span className="col-span-2 text-right">Score</span>
            </div>
            {FEATURED_REPOS.map((r, i) => (
              <div
                key={`${r.owner}/${r.repo}`}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <span className="col-span-1 font-mono text-muted-foreground">{i + 1}</span>
                <a
                  href={`https://github.com/${r.owner}/${r.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-6 font-medium hover:text-primary"
                >
                  {r.owner}/{r.repo}
                </a>
                <span className="col-span-3 text-sm text-muted-foreground">{r.language}</span>
                <span className="col-span-2 text-right font-bold text-primary">{r.score}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Add AGENTS.md to your repo and run{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">agentmd score</code>{" "}
            to see where you rank.
          </p>
        </div>
      </main>
    </div>
  );
}
