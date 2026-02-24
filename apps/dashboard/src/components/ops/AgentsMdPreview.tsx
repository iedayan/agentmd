"use client";

export function AgentsMdPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  const sectionRegex = /^\[([^\]]+)\]/;

  return (
    <div className="border border-[var(--ops-border)] bg-[var(--ops-panel)]">
      <div className="border-b border-[var(--ops-border)] px-4 py-2 font-mono text-xs font-medium text-[var(--ops-primary)]/70">
        AGENTS.md
      </div>
      <pre className="max-h-[320px] overflow-auto p-4 font-mono text-xs leading-relaxed text-[var(--ops-primary)]">
        {lines.map((line, i) => {
          const sectionMatch = line.match(sectionRegex);
          const isSection = sectionMatch !== null;
          const isComment = line.trim().startsWith("#");
          return (
            <div key={i} className="flex">
              <span className="w-8 shrink-0 select-none pr-4 text-right text-[var(--ops-primary)]/40">
                {i + 1}
              </span>
              <code
                className={
                  isSection
                    ? "text-[var(--ops-running)] font-semibold"
                    : isComment
                    ? "text-[var(--ops-primary)]/80"
                    : ""
                }
              >
                {line || " "}
              </code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
