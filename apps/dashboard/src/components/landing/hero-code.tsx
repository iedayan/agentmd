"use client";

const FILE = {
  name: "AGENTS.md",
  lines: [
    { type: "fm",      txt: "---" },
    { type: "comment", txt: "# Agent instructions for AI coding tools" },
    { type: "fm",      txt: "---" },
    { type: "blank",   txt: "" },
    { type: "h2",      txt: "## Build" },
    { type: "blank",   txt: "" },
    { type: "fence",   txt: "```bash" },
    { type: "cmd",     txt: "pnpm run build" },
    { type: "fence",   txt: "```" },
    { type: "blank",   txt: "" },
    { type: "h2",      txt: "## Test" },
    { type: "blank",   txt: "" },
    { type: "fence",   txt: "```bash" },
    { type: "cmd",     txt: "pnpm run test" },
    { type: "fence",   txt: "```" },
    { type: "blank",   txt: "" },
    { type: "h2",      txt: "## Lint" },
    { type: "blank",   txt: "" },
    { type: "fence",   txt: "```bash" },
    { type: "cmd",     txt: "pnpm run lint" },
    { type: "fence",   txt: "```" },
  ],
};

function color(type: string): string {
  switch (type) {
    case "h2":      return "#34d399"; // emerald-400 (primary)
    case "cmd":     return "#e4e4e7";
    case "comment": return "#52525b";
    case "fm":      return "#6ee7b7"; // emerald-300
    case "fence":   return "#3f3f46";
    default:        return "transparent";
  }
}

export function HeroCode() {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl"
      style={{ background: "#0f0f10" }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]"
        style={{ background: "#18181b" }}
      >
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-auto font-mono text-[11px] text-zinc-500">AGENTS.md</span>
      </div>

      {/* Editor body */}
      <div className="flex min-h-[280px]">
        {/* Gutter */}
        <div
          className="py-5 px-3 select-none border-r border-white/[0.04]"
          style={{ background: "#0f0f10", minWidth: "2.5rem" }}
          aria-hidden
        >
          {FILE.lines.map((_, i) => (
            <div
              key={i}
              className="h-6 flex items-center justify-end font-mono text-[11px]"
              style={{ color: "#3f3f46", lineHeight: "1.5rem" }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code */}
        <pre className="flex-1 py-5 px-5 overflow-x-auto text-[13px] font-mono leading-6">
          <code>
            {FILE.lines.map((line, i) => (
              <div key={i} className="h-6 flex items-center whitespace-pre">
                {line.type === "cmd" ? (
                  <span>
                    <span style={{ color: "#34d399" }}>{"$ "}</span>
                    <span style={{ color: color(line.type) }}>{line.txt}</span>
                  </span>
                ) : line.txt ? (
                  <span style={{ color: color(line.type) }}>{line.txt}</span>
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] font-mono text-[11px]"
        style={{ background: "#18181b", color: "#52525b" }}
      >
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span style={{ color: "#71717a" }}>valid · score 94</span>
        </span>
        <span>Markdown</span>
      </div>
    </div>
  );
}
