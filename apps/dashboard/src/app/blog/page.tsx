import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';

const POSTS = [
  { slug: 'agentmd-and-ai-governance', title: 'AgentMD and AI Governance', date: '2025-02-21' },
  { slug: 'agents-md-best-practices', title: 'AGENTS.md Best Practices', date: '2024-02-20' },
  {
    slug: 'migrating-from-claude-md',
    title: 'Migrating from CLAUDE.md to AGENTS.md',
    date: '2024-02-18',
  },
  {
    slug: 'case-study-monorepo',
    title: 'Case Study: Scaling AGENTS.md in a Monorepo',
    date: '2024-02-15',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Logo size="md" />
            AgentMD
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/docs">
              <Button variant="ghost">Docs</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="mt-4 text-muted-foreground">
          AGENTS.md best practices, migration guides, and case studies
        </p>

        <div className="mt-12 space-y-8">
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="rounded-lg border p-6 hover:border-primary/50 transition-colors">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-sm text-muted-foreground mt-2">{post.date}</p>
              </article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
