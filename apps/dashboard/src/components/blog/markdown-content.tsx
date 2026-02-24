"use client";

/**
 * Simple markdown renderer for blog posts. Handles ##, ###, -, **, `, and code blocks.
 */
export function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-xl font-semibold mt-12 mb-4 pb-2 border-b border-border">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold mt-8 mb-3">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={key++} className="rounded-lg bg-muted p-4 text-sm overflow-x-auto my-6">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside my-4 space-y-2 text-muted-foreground">
          {items.map((item, j) => (
            <li key={j}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [line.replace(/^\d+\.\s/, "")];
      i++;
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside my-4 space-y-2 text-muted-foreground">
          {items.map((item, j) => (
            <li key={j}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    elements.push(
      <p key={key++} className="leading-7 text-muted-foreground mb-4">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="[&_a]:text-primary [&_a]:hover:underline">{elements}</div>;
}

function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);

    let earliest: { index: number; type: "bold" | "code"; match: RegExpMatchArray } | null = null;
    if (boldMatch && boldMatch.index !== undefined) {
      earliest = { index: boldMatch.index, type: "bold", match: boldMatch };
    }
    if (codeMatch && codeMatch.index !== undefined) {
      if (!earliest || codeMatch.index < earliest.index) {
        earliest = { index: codeMatch.index, type: "code", match: codeMatch };
      }
    }

    if (!earliest) {
      parts.push(<span key={partKey++}>{remaining}</span>);
      break;
    }

    if (earliest.index > 0) {
      parts.push(<span key={partKey++}>{remaining.slice(0, earliest.index)}</span>);
    }
    if (earliest.type === "bold") {
      parts.push(<strong key={partKey++}>{earliest.match[1]}</strong>);
    } else {
      parts.push(
        <code key={partKey++} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
          {earliest.match[1]}
        </code>
      );
    }
    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return <>{parts}</>;
}
