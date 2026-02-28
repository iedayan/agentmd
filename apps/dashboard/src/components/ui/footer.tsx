import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

export function Footer() {
  return (
    <footer className="border-t border-border py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:gap-10 md:flex-row md:justify-between">
          <div className="max-w-[200px]">
            <Link href="/" className="flex items-center gap-2 font-semibold mb-2">
              <Logo size="sm" />
              <span>AgentMD</span>
            </Link>
            <p className="text-xs text-muted-foreground">The CI/CD control plane for AI agents.</p>
          </div>
          <nav className="flex flex-wrap gap-8 sm:gap-10 md:gap-12" aria-label="Footer navigation">
            <FooterCol
              heading="Product"
              links={[
                ['Features', '/features'],
                ['Pricing', '/pricing'],
                ['FAQ', '/faq'],
                ['Docs', '/docs'],
                ['Design System', '/design-system'],
              ]}
            />
            <FooterCol
              heading="Solutions"
              links={[
                ['For CI/CD', '/for/ci-cd'],
                ['For Enterprises', '/for/enterprises'],
                ['Case Studies & ROI', '/case-studies'],
                ['Leaderboard', '/leaderboard'],
              ]}
            />
            <FooterCol
              heading="Developers"
              links={[
                [
                  'GitHub Action',
                  'https://github.com/iedayan/agentmd/tree/main/.github/actions/agentmd',
                ],
                ['AGENTS.md spec', 'https://agents.md'],
              ]}
            />
            <FooterCol
              heading="Company"
              links={[
                ['Contact', '/contact'],
                ['Leave a review', '/review'],
                ['Blog', '/blog'],
                ['Roadmap', '/roadmap'],
                ['Status', '/status'],
              ]}
            />
            <FooterCol
              heading="Legal"
              links={[
                ['Privacy', '/privacy'],
                ['Terms', '/terms'],
                ['Cookies', '/cookies'],
                ['GDPR', '/gdpr'],
              ]}
            />
          </nav>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} AgentMD</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ heading, links }: { heading: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {heading}
      </h4>
      <ul className="space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            {href.startsWith('http') ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
