"use client";

import { useState } from "react";
import { Check, Copy, Terminal, Github, Package, ExternalLink } from "lucide-react";

const COMMANDS: {
  label: string;
  desc: string;
  cmd: string;
  href?: string;
  icon: typeof Terminal;
  primary?: boolean;
}[] = [
  {
    label: "Try without installing",
    desc: "No install required",
    cmd: "npx @agentmd/cli init",
    icon: Terminal,
    primary: true,
  },
  {
    label: "GitHub Action",
    desc: "Add to CI",
    cmd: "uses: agentmd/agentmd/.github/actions/agentmd@main",
    icon: Github,
  },
  {
    label: "Add to GitHub",
    desc: "Install the app",
    cmd: "https://github.com/apps/agentmd",
    href: "https://github.com/apps/agentmd",
    icon: Github,
  },
  {
    label: "npm package",
    desc: "Add to project",
    cmd: "pnpm add @agentmd/core",
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
      <div className="grid gap-3 sm:grid-cols-2">
        {COMMANDS.map(({ label, desc, cmd, href, icon: Icon, primary }) => (
          <div
            key={cmd}
            className={`group flex items-stretch gap-3 rounded-xl border bg-background p-4 transition-all ${
              primary
                ? "border-primary/40 bg-primary/5 shadow-sm dark:bg-primary/5"
                : "border-border/60 hover:border-border hover:bg-muted/30"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                primary ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
              <code className="mt-2 block break-all font-mono text-sm text-foreground/90 sm:truncate">
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
                  aria-label={copied === cmd ? "Copied to clipboard" : `Copy ${cmd}`}
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
