'use client';

export function AgentsMdPreview({ content }: { content: string }) {
  const lines = content.split('\n');
  const sectionRegex = /^\[([^\]]+)\]/;

  return (
    <div className="bento-card border-luminescent bg-card">
      <div className="border-b border-border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        AGENTS.md
      </div>
      <pre className="max-h-[320px] overflow-auto p-4 font-mono text-xs leading-relaxed text-foreground">
        {lines.map((line, i) => {
          const sectionMatch = line.match(sectionRegex);
          const isSection = sectionMatch !== null;
          const isComment = line.trim().startsWith('#');
          return (
            <div key={i} className="flex">
              <span className="w-8 shrink-0 select-none pr-4 text-right text-muted-foreground">
                {i + 1}
              </span>
              <code
                className={
                  isSection
                    ? 'text-primary font-bold'
                    : isComment
                      ? 'text-muted-foreground italic'
                      : ''
                }
              >
                {line || ' '}
              </code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
