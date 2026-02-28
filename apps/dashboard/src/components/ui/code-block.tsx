import * as React from 'react';
import { cn } from '@/lib/core/utils';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  /** Optional filename or language label shown in the header */
  label?: string;
}

const CodeBlock = React.forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/50 overflow-hidden shadow-sm">
        {label && (
          <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span className="font-mono text-xs text-muted-foreground">{label}</span>
          </div>
        )}
        <pre
          ref={ref}
          className={cn(
            'overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground/90',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border',
            className,
          )}
          {...props}
        >
          {children}
        </pre>
      </div>
    );
  },
);
CodeBlock.displayName = 'CodeBlock';

/** Inline code, Primer-style */
function Code({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        'rounded-md border border-border/50 bg-muted/80 px-1.5 py-0.5 font-mono text-[0.875em] text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { CodeBlock, Code };
