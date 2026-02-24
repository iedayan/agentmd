import { describe, it, expect } from "vitest";
import { parseAgentsMd, findSection } from "../parser.js";

const SAMPLE = `# My Project

## Testing instructions
- Run \`pnpm test\` before committing.
- Use \`pnpm vitest run -t "test name"\` for focused tests.

## Build commands
\`pnpm run build\` from root.

## PR guidelines
- Title: [package] Description
- Always run \`pnpm lint\` and \`pnpm test\`.
`;

describe("parseAgentsMd", () => {
  it("extracts sections", () => {
    const parsed = parseAgentsMd(SAMPLE);
    expect(parsed.sections.length).toBeGreaterThanOrEqual(3);
    const titles = parsed.sections.map((s) => s.title);
    expect(titles).toContain("Testing instructions");
    expect(titles).toContain("Build commands");
    expect(titles).toContain("PR guidelines");
  });

  it("extracts commands", () => {
    const parsed = parseAgentsMd(SAMPLE);
    expect(parsed.commands.length).toBeGreaterThanOrEqual(3);
    const commands = parsed.commands.map((c) => c.command);
    expect(commands).toContain("pnpm test");
    expect(commands).toContain("pnpm run build");
    expect(commands).toContain("pnpm lint");
  });

  it("counts lines", () => {
    const parsed = parseAgentsMd(SAMPLE);
    expect(parsed.lineCount).toBeGreaterThan(10);
  });

  it("infers command types", () => {
    const parsed = parseAgentsMd(SAMPLE);
    const testCmd = parsed.commands.find((c) => c.command.includes("test"));
    expect(testCmd?.type).toBe("test");
    const buildCmd = parsed.commands.find((c) => c.command.includes("build"));
    expect(buildCmd?.type).toBe("build");
  });
});

describe("findSection", () => {
  it("finds section by partial title", () => {
    const parsed = parseAgentsMd(SAMPLE);
    const section = findSection(parsed, "testing");
    expect(section).toBeDefined();
    expect(section?.title).toContain("Testing");
  });

  it("returns undefined for missing section", () => {
    const parsed = parseAgentsMd(SAMPLE);
    const section = findSection(parsed, "nonexistent");
    expect(section).toBeUndefined();
  });

  it("finds nested child section", () => {
    const content = `# Root
## Parent
### Child Section
Content here.
`;
    const parsed = parseAgentsMd(content);
    const section = findSection(parsed, "child");
    expect(section).toBeDefined();
    expect(section?.title).toBe("Child Section");
  });

  it("is case-insensitive", () => {
    const parsed = parseAgentsMd(SAMPLE);
    const section = findSection(parsed, "BUILD");
    expect(section).toBeDefined();
    expect(section?.title).toContain("Build");
  });
});

describe("parseAgentsMd sections", () => {
  it("flattens ## when under single # root", () => {
    const content = `# Project
## Build
\`pnpm build\`
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    expect(parsed.sections.length).toBe(2);
    expect(parsed.sections.map((s) => s.title)).toEqual(["Build", "Test"]);
  });

  it("preserves nested ### under ##", () => {
    const content = `## Build
### From root
\`pnpm build\`
### From packages
\`pnpm -r build\`
`;
    const parsed = parseAgentsMd(content);
    expect(parsed.sections.length).toBe(1);
    expect(parsed.sections[0]?.children.length).toBe(2);
    expect(parsed.sections[0]?.children.map((c) => c.title)).toEqual(["From root", "From packages"]);
  });

  it("includes filePath when provided", () => {
    const parsed = parseAgentsMd(SAMPLE, "/repo/AGENTS.md");
    expect(parsed.filePath).toBe("/repo/AGENTS.md");
  });

  it("extracts directives when present", () => {
    const content = `<!-- agents-md: target=root -->
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    expect(parsed.directives).toBeDefined();
    expect(parsed.directives?.length).toBe(1);
    expect(parsed.directives?.[0].params.target).toBe("root");
  });
});
