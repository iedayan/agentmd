import { describe, it, expect } from "vitest";
import { parseAgentsMd } from "../parser.js";
import { validateAgentsMd, computeAgentReadinessScore } from "../validator.js";

describe("validateAgentsMd", () => {
  it("validates empty file as invalid", async () => {
    const parsed = parseAgentsMd("");
    const result = await validateAgentsMd(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "EMPTY")).toBe(true);
  });

  it("validates file with content", async () => {
    const parsed = parseAgentsMd("## Testing\nRun `pnpm test`");
    const result = await validateAgentsMd(parsed);
    expect(result.valid).toBe(true);
  });

  it("warns on long file", async () => {
    const longContent = "# X\n" + "line\n".repeat(160);
    const parsed = parseAgentsMd(longContent);
    const result = await validateAgentsMd(parsed);
    expect(result.warnings.some((w) => w.code === "LONG_FILE")).toBe(true);
  });

  it("suggests sections when missing", async () => {
    const parsed = parseAgentsMd("Some text without headings.");
    const result = await validateAgentsMd(parsed);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("validates frontmatter permissions.shell.default", async () => {
    const content = `---
permissions:
  shell:
    default: invalid
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.errors.some((e) => e.code === "INVALID_SHELL_DEFAULT")).toBe(true);
  });

  it("warns on conflicting directives", async () => {
    const content = `<!-- agents-md: target=root -->
<!-- agents-md: target=nearest -->
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.warnings.some((w) => w.code === "CONFLICTING_TARGETS")).toBe(true);
  });

  it("fails on invalid file permission level", async () => {
    const content = `---
permissions:
  files:
    read: maybe
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.errors.some((e) => e.code === "INVALID_FILE_PERMISSION")).toBe(true);
  });

  it("fails on empty shell allow entries", async () => {
    const content = `---
permissions:
  shell:
    allow: [""]
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.errors.some((e) => e.code === "INVALID_SHELL_ALLOW")).toBe(true);
  });

  it("fails on invalid trigger format", async () => {
    const content = `---
triggers:
  - pull request
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.errors.some((e) => e.code === "INVALID_TRIGGER_FORMAT")).toBe(true);
  });
});

describe("computeAgentReadinessScore", () => {
  it("returns low score for empty or minimal content", async () => {
    const parsed = parseAgentsMd("");
    const score = await computeAgentReadinessScore(parsed);
    // Empty gets allCommandsSafe bonus (no unsafe commands) but no sections/commands
    expect(score).toBeLessThan(30);
  });

  it("returns higher score for content with sections and commands", async () => {
    const minimal = parseAgentsMd("## Build\n`pnpm build`");
    const full = parseAgentsMd(`## Build
\`pnpm build\`
## Test
\`pnpm test\`
## PR
Run \`pnpm lint\` before merge
`);
    expect(await computeAgentReadinessScore(full)).toBeGreaterThan(await computeAgentReadinessScore(minimal));
  });

  it("returns value between 0 and 100", async () => {
    const parsed = parseAgentsMd("## Build\n`pnpm build`\n## Test\n`pnpm test`");
    const score = await computeAgentReadinessScore(parsed);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives bonus for deploy section", async () => {
    const without = parseAgentsMd("## Build\n`pnpm build`");
    const withDeploy = parseAgentsMd(`## Build
\`pnpm build\`
## Deploy
\`pnpm run deploy\`
`);
    expect(await computeAgentReadinessScore(withDeploy)).toBeGreaterThan(
      await computeAgentReadinessScore(without)
    );
  });

  it("gives bonus for frontmatter", async () => {
    const without = parseAgentsMd("## Build\n`pnpm build`");
    const withFm = parseAgentsMd(`---
version: "1.0"
---
## Build
\`pnpm build\`
`);
    expect(await computeAgentReadinessScore(withFm)).toBeGreaterThanOrEqual(
      await computeAgentReadinessScore(without)
    );
  });

  it("gives bonus for install/setup section", async () => {
    const without = parseAgentsMd("## Build\n`pnpm build`");
    const withInstall = parseAgentsMd(`## Build
\`pnpm build\`
## Install
\`pnpm install\`
`);
    expect(await computeAgentReadinessScore(withInstall)).toBeGreaterThan(
      await computeAgentReadinessScore(without)
    );
  });

  it("gives bonus for frontmatter detail (name, purpose, triggers)", async () => {
    const minimalFm = parseAgentsMd(`---
version: "1.0"
---
## Build
\`pnpm build\`
`);
    const detailedFm = parseAgentsMd(`---
name: my-agent
purpose: Run tests and builds
---
## Build
\`pnpm build\`
`);
    expect(await computeAgentReadinessScore(detailedFm)).toBeGreaterThan(
      await computeAgentReadinessScore(minimalFm)
    );
  });

  it("applies length penalty for files over 150 lines", async () => {
    const short = parseAgentsMd("# X\n" + "line\n".repeat(50) + "\n## Build\n`pnpm build`");
    const long = parseAgentsMd("# X\n" + "line\n".repeat(160) + "\n## Build\n`pnpm build`");
    expect(await computeAgentReadinessScore(long)).toBeLessThan(await computeAgentReadinessScore(short));
  });
});

describe("validateAgentsMd additional", () => {
  it("reports unsafe command as error", async () => {
    const content = "## Bad\n`rm -rf /`\n## Good\n`pnpm test`";
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "UNSAFE_COMMAND")).toBe(true);
  });

  it("fails on invalid metadata entry (empty key)", async () => {
    const content = `---
metadata:
  "": "value"
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.errors.some((e) => e.code === "INVALID_METADATA_ENTRY")).toBe(true);
  });

  it("fails on invalid guardrail (empty string in array)", async () => {
    const content = `---
guardrails:
  - "Valid rule"
  - ""
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.errors.some((e) => e.code === "INVALID_GUARDRAIL")).toBe(true);
  });

  it("suggests 3-5 commands when fewer than 3", async () => {
    const parsed = parseAgentsMd("## Build\n`pnpm build`");
    const result = await validateAgentsMd(parsed);
    expect(result.suggestions.some((s) => s.includes("3-5"))).toBe(true);
  });

  it("suggests reducing when more than 10 commands", async () => {
    const cmds = Array.from({ length: 12 }, (_, i) => `\`echo step${i}\``).join("\n");
    const parsed = parseAgentsMd(`## Steps\n${cmds}`);
    const result = await validateAgentsMd(parsed);
    expect(result.suggestions.some((s) => s.includes("3-5 core"))).toBe(true);
  });

  it("fails on invalid resource permission level", async () => {
    const content = `---
permissions:
  pull_requests: invalid
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.errors.some((e) => e.code === "INVALID_RESOURCE_PERMISSION")).toBe(true);
  });

  it("requires output_contract when strict contract mode is enabled", async () => {
    const parsed = parseAgentsMd("## Test\n`pnpm test`\n");
    const result = await validateAgentsMd(parsed, { requireOutputContract: true });
    expect(result.errors.some((e) => e.code === "MISSING_OUTPUT_CONTRACT")).toBe(true);
  });

  it("fails on incomplete output_contract", async () => {
    const content = `---
output_contract:
  format: json
  schema:
    summary: string
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = await validateAgentsMd(parsed);
    expect(result.errors.some((e) => e.code === "INVALID_OUTPUT_CONTRACT_QUALITY_GATES")).toBe(true);
    expect(result.errors.some((e) => e.code === "INVALID_OUTPUT_CONTRACT_ARTIFACTS")).toBe(true);
    expect(result.errors.some((e) => e.code === "INVALID_OUTPUT_CONTRACT_EXIT_CRITERIA")).toBe(true);
  });
});
