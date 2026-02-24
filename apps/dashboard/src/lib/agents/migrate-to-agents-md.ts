/**
 * Convert various agent instruction formats to AGENTS.md.
 * Handles CLAUDE.md, .cursorrules, and similar prose/command formats.
 */

export function convertToAgentsMd(
  content: string,
  sourceId: string
): string {
  const trimmed = content.trim();
  if (!trimmed) return "";

  switch (sourceId) {
    case "claude":
      return convertClaudeMd(trimmed);
    case "cursorrules":
      return convertCursorRules(trimmed);
    case "aider":
      return convertAider(trimmed);
    case "gemini":
      return convertGemini(trimmed);
    default:
      return convertGeneric(trimmed);
  }
}

function convertClaudeMd(content: string): string {
  const sections: string[] = [];
  const lines = content.split("\n");
  let currentSection = "";
  let currentCommands: string[] = [];

  const flushSection = (title: string, commands: string[]) => {
    if (title && commands.length > 0) {
      sections.push(`## ${title}\n\n${commands.map((c) => `\`${c}\`\n`).join("")}`);
    } else if (commands.length > 0) {
      sections.push(commands.map((c) => `\`${c}\`\n`).join(""));
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("#")) {
      flushSection(currentSection, currentCommands);
      currentSection = trimmed.replace(/^#+\s*/, "").trim();
      currentCommands = [];
      continue;
    }

    const cmd = extractCommand(trimmed);
    if (cmd) {
      currentCommands.push(cmd);
    }
  }
  flushSection(currentSection, currentCommands);

  return sections.join("\n\n") || content;
}

function convertCursorRules(content: string): string {
  const commands: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    const cmd = extractCommand(trimmed);
    if (cmd) commands.push(cmd);
  }

  if (commands.length === 0) return content;

  const sections: Record<string, string[]> = {
    build: [] as string[],
    test: [] as string[],
    lint: [] as string[],
    other: [] as string[],
  };

  for (const cmd of commands) {
    const lower = cmd.toLowerCase();
    if (lower.includes("build") || lower.includes("compile")) {
      sections.build.push(cmd);
    } else if (lower.includes("test") || lower.includes("pytest") || lower.includes("jest")) {
      sections.test.push(cmd);
    } else if (lower.includes("lint") || lower.includes("format")) {
      sections.lint.push(cmd);
    } else {
      sections.other.push(cmd);
    }
  }

  const parts: string[] = [];
  if (sections.build.length) parts.push(`## Build\n\n${sections.build.map((c) => `\`${c}\`\n`).join("")}`);
  if (sections.test.length) parts.push(`## Test\n\n${sections.test.map((c) => `\`${c}\`\n`).join("")}`);
  if (sections.lint.length) parts.push(`## Lint\n\n${sections.lint.map((c) => `\`${c}\`\n`).join("")}`);
  if (sections.other.length) parts.push(`## Other\n\n${sections.other.map((c) => `\`${c}\`\n`).join("")}`);

  return parts.join("\n\n") || content;
}

function convertAider(content: string): string {
  const commands: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    const cmd = extractCommand(trimmed);
    if (cmd) commands.push(cmd);
  }

  if (commands.length === 0) return content;

  return `## Setup\n\n${commands.map((c) => `\`${c}\`\n`).join("")}`;
}

function convertGemini(content: string): string {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const commands: string[] = [];
    if (Array.isArray(parsed.commands)) {
      for (const c of parsed.commands) {
        if (typeof c === "string") commands.push(c);
      }
    }
    if (commands.length === 0) return content;
    return `## Commands\n\n${commands.map((c) => `\`${c}\`\n`).join("")}`;
  } catch {
    return convertGeneric(content);
  }
}

function convertGeneric(content: string): string {
  const commands: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const cmd = extractCommand(line.trim());
    if (cmd) commands.push(cmd);
  }

  if (commands.length === 0) return content;

  return `## Commands\n\n${commands.map((c) => `\`${c}\`\n`).join("")}`;
}

function extractCommand(line: string): string | null {
  if (!line || line.startsWith("#") || line.startsWith("//")) return null;

  const backtickMatch = line.match(/`([^`]+)`/);
  if (backtickMatch) return backtickMatch[1].trim();

  const codeBlockMatch = line.match(/`{3}\w*\n?([\s\S]*?)`{3}/);
  if (codeBlockMatch) return codeBlockMatch[1].trim().split("\n")[0]?.trim() ?? null;

  if (line.startsWith("$ ")) return line.slice(2).trim();
  if (line.startsWith("> ")) return line.slice(2).trim();

  const runPatterns = [
    /^(?:run|execute|command):\s*(.+)$/i,
    /^(?:npm|pnpm|yarn|bun)\s+(.+)$/,
    /^(?:python|python3|uv)\s+(.+)$/,
    /^(?:cargo|go|make)\s+(.+)$/,
  ];
  for (const re of runPatterns) {
    const m = line.match(re);
    if (m) return m[1].trim();
  }

  if (line.length < 100 && /^[a-z0-9._\-\s]+$/i.test(line) && !line.includes(" ")) return null;
  if (line.includes(" ") && line.length < 80 && /^[a-z0-9._\-\s\/]+$/i.test(line)) return line;

  return null;
}
