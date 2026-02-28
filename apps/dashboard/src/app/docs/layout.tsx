import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { DocsContent } from '@/components/docs/docs-content';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Logo size="md" />
            AgentMD
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/docs">
              <Button variant="ghost" size="sm">
                Docs
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 flex gap-16">
        <DocsSidebar />
        <main className="flex-1 min-w-0 max-w-3xl">
          <DocsContent>{children}</DocsContent>
        </main>
      </div>
    </div>
  );
}
