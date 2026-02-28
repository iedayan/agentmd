'use client';

import { useState } from 'react';
import { Check, Copy, Terminal, Github, Package, ExternalLink } from 'lucide-react';

const COMMANDS: {
  label: string;
  desc: string;
  cmd: string;
  href?: string;
  icon: typeof Terminal;
  primary?: boolean;
}[] = [
  {
    label: 'Get started in 60 seconds',
    desc: 'One command, no install',
    cmd: 'npx @agentmd-dev/cli init',
    icon: Terminal,
    primary: true,
  },
  {
    label: 'GitHub Action',
    desc: 'Add to CI (Pinned SHA)',
    cmd: 'uses: iedayan/agentmd/.github/actions/agentmd@7f23caa9a688230815368fc07716828884479cad',
    icon: Github,
  },
  {
    label: 'Add to GitHub',
    desc: 'Install the app',
    cmd: '/github/install',
    href: '/github/install',
    icon: Github,
  },
  {
    label: 'npm package',
    desc: 'Add to project',
    cmd: 'pnpm add @agentmd-dev/core',
    icon: Package,
  },
];

export function QuickInstall() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (cmd: string) => {
    await navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-10">
      <p className="mb-3 text-xs font-mono tracking-[0.15em] text-muted-foreground/70 uppercase">
        Quick install
      </p>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {COMMANDS.map(({ label, desc, cmd, href, icon: Icon, primary }) => (
          <div
            key={cmd}
            className={`group flex items-stretch gap-3 rounded-2xl border bg-background p-4 transition-all ${
              primary
                ? 'border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10'
                : 'border-border/60 hover:border-border hover:bg-muted/30'
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                primary
                  ? 'bg-gradient-to-br from-primary/25 to-primary/10 text-primary ring-1 ring-primary/20 shadow-sm'
                  : 'bg-muted/80 text-muted-foreground group-hover:bg-muted group-hover:text-foreground ring-1 ring-border/50'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="font-medium text-foreground truncate">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
              <code className="mt-2 block break-all font-mono text-xs sm:text-sm text-foreground/90">
                {cmd}
              </code>
            </div>
            <div className="flex shrink-0 items-center">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => copy(cmd)}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/50 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-[72px]"
                  aria-label={copied === cmd ? 'Copied to clipboard' : `Copy ${cmd}`}
                >
                  {copied === cmd ? (
                    <>
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-primary hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
