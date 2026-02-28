'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/core/utils';

export function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = typeof children === 'string' ? children : String(children ?? '');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group">
      <pre
        className={cn(
          'rounded-lg bg-muted/80 p-4 pr-12 overflow-x-auto text-sm border border-border/50',
          className,
        )}
      >
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-3 right-3 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
