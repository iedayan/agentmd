import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold text-foreground hover:text-foreground">
            <Logo size="md" />
            AgentMD
          </Link>
          <Link href="/">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 lg:px-8 py-12 md:py-16 max-w-3xl">
        <article className="docs-prose">
          <h1>{title}</h1>
          {children}
        </article>
      </main>
    </div>
  );
}
