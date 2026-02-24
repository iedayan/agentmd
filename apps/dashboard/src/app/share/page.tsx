import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Agent-readiness score | AgentMD",
  description: "Share your agent-readiness score",
  openGraph: {
    title: "Agent-readiness score | AgentMD",
    description: "My repo is agent-ready",
  },
};

export default function SharePage({
  searchParams,
}: {
  searchParams: { score?: string };
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <ShareContent searchParams={searchParams} />
    </div>
  );
}

function ShareContent({
  searchParams,
}: {
  searchParams: { score?: string };
}) {
  const params = searchParams;
  const scoreRaw = params.score;
  const score = scoreRaw != null ? Math.min(100, Math.max(0, parseInt(scoreRaw, 10) || 0)) : null;

  return (
    <div className="w-full max-w-md text-center">
      <Link href="/" className="inline-flex items-center gap-2 font-semibold mb-8 text-muted-foreground hover:text-foreground">
        <Logo size="sm" />
        AgentMD
      </Link>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Agent-readiness score
        </p>
        {score !== null ? (
          <>
            <div className="text-5xl font-bold text-primary tabular-nums">{score}</div>
            <p className="text-muted-foreground mt-1">/ 100</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Is your repo agent-ready?{" "}
              <Link href="/" className="text-primary hover:underline">
                Check yours
              </Link>
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              Get your agent-readiness score
            </Link>
          </p>
        )}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">AgentMD</Link> — CI/CD for AI agents
      </p>
    </div>
  );
}
