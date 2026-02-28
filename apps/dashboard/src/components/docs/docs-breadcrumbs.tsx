'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const LABELS: Record<string, string> = {
  docs: 'Docs',
  quickstart: 'Quickstart',
  parse: 'Parse & Validate',
  cli: 'CLI Reference',
  frontmatter: 'YAML Frontmatter',
  compose: 'Composition',
  execution: 'Execution & Safety',
};

export function DocsBreadcrumbs() {
  const pathname = usePathname() ?? '';
  if (!pathname.startsWith('/docs')) return null;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
      <Link href="/docs" className="hover:text-foreground transition-colors">
        Docs
      </Link>
      {segments.slice(1).map((seg, i) => {
        const href = '/' + segments.slice(0, i + 2).join('/');
        const label = LABELS[seg] ?? seg;
        const isLast = i === segments.length - 2;
        return (
          <span key={href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
