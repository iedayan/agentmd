import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/brand/logo';
import { buildOgUrl } from '@/lib/og';

type Props = { searchParams: Promise<{ score?: string }> | { score?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await Promise.resolve(searchParams);
  const scoreRaw = params.score;
  const score = scoreRaw != null ? Math.min(100, Math.max(0, parseInt(scoreRaw, 10) || 0)) : null;

  const title =
    score != null ? `Agent-readiness ${score}/100 | AgentMD` : 'Agent-readiness score | AgentMD';
  const description = score != null ? 'My repo is agent-ready' : 'Share your agent-readiness score';

  const ogUrl =
    score != null
      ? buildOgUrl({ title: 'Agent-readiness score', score, site: 'agentmd.online' })
      : buildOgUrl({ title: 'Agent-readiness score', description: 'Share your score' });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await Promise.resolve(searchParams);
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <ShareContent params={params} />
    </div>
  );
}

function ShareContent({ params }: { params: { score?: string } }) {
  const scoreRaw = params.score;
  const score = scoreRaw != null ? Math.min(100, Math.max(0, parseInt(scoreRaw, 10) || 0)) : null;

  return (
    <div className="w-full max-w-md text-center">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-semibold mb-8 text-muted-foreground hover:text-foreground"
      >
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
              Is your repo agent-ready?{' '}
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
        <Link href="/" className="hover:text-foreground">
          AgentMD
        </Link>{' '}
        — CI/CD for AI agents
      </p>
    </div>
  );
}
