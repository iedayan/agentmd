'use client';

import { useState } from 'react';
import { Copy, Check, X, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface BadgeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoFullName: string;
  repoName: string;
}

export function BadgeShareModal({ isOpen, onClose, repoFullName, repoName }: BadgeShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://agentmd.online';
  const badgeUrl = `${baseUrl}/api/badge/score?repo=${repoFullName}`;
  const linkUrl = `${baseUrl}/share?repo=${repoFullName}`;

  const snippets = [
    {
      label: 'Markdown',
      code: `[![Agent-Ready](${badgeUrl})](${linkUrl})`,
    },
    {
      label: 'HTML',
      code: `<a href="${linkUrl}"><img src="${badgeUrl}" alt="Agent-Ready" /></a>`,
    },
  ];

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} snippet copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg glass-card bg-background border border-primary/20 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Showcase Accuracy</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Share your agent-readiness
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-0 space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Add the live AgentMD badge to{' '}
              <span className="text-foreground font-bold">{repoName}</span>&apos;s README to signal
              reliability to partners and agents.
            </p>

            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-muted/30 border border-border/40 bg-gradient-to-br from-primary/[0.02] to-transparent">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-6">
                Live Preview
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic badge URL from API; Next Image requires known domains */}
              <img src={badgeUrl} alt="Agent-Ready Badge Preview" className="shadow-glow/20" />
            </div>

            <div className="space-y-4">
              {snippets.map((snippet) => (
                <div key={snippet.label} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      {snippet.label}
                    </label>
                  </div>
                  <div className="relative group">
                    <pre className="p-4 rounded-xl bg-muted/50 border border-border/40 font-mono text-[11px] text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all pr-12 group-hover:bg-muted/80 transition-colors">
                      {snippet.code}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(snippet.code, snippet.label)}
                      className="absolute right-2 top-2 p-2 rounded-lg bg-background border border-border/40 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-muted hover:border-primary/20"
                      title={`Copy ${snippet.label}`}
                    >
                      {copied === snippet.label ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11 font-black text-[10px] uppercase tracking-widest"
              onClick={() => window.open(linkUrl, '_blank')}
            >
              Public Score Page
              <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-40 " />
            </Button>
            <Button
              className="flex-1 rounded-xl h-11 font-black text-[10px] uppercase tracking-widest shadow-glow"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
