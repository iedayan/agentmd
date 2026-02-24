import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "../route";

function createRequest(body: unknown, headers?: Record<string, string>): Request {
  return new Request("http://localhost/api/demo/parse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/demo/parse", () => {
  beforeEach(() => {
    // Rate limit is per-key; use unique header to avoid hitting limit
    const unique = `test-${Date.now()}-${Math.random()}`;
    (globalThis as unknown as { __testClientKey?: string }).__testClientKey = unique;
  });

  it("returns 400 when content is missing", async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("Content is required");
  });

  it("returns 400 when content is empty string", async () => {
    const res = await POST(createRequest({ content: "" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Content is required");
  });

  it("returns 400 when content is whitespace only", async () => {
    const res = await POST(createRequest({ content: "   \n\t  " }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Content is required");
  });

  it("returns 400 when content exceeds 50k chars", async () => {
    const res = await POST(createRequest({ content: "x".repeat(50_001) }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Content too long");
  });

  it("parses valid AGENTS.md and returns score", async () => {
    const content = `## Build
\`\`\`bash
pnpm run build
\`\`\`

## Test
\`\`\`bash
pnpm run test
\`\`\`
`;
    const res = await POST(createRequest({ content }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.parsed).toBeDefined();
    expect(json.parsed.sections.length).toBeGreaterThanOrEqual(2);
    expect(json.parsed.commands.length).toBeGreaterThanOrEqual(2);
    expect(json.validation).toBeDefined();
    expect(typeof json.score).toBe("number");
    expect(json.score).toBeGreaterThanOrEqual(0);
    expect(json.score).toBeLessThanOrEqual(100);
  });

  it("returns validation result for minimal content", async () => {
    const content = "Some text without headings.";
    const res = await POST(createRequest({ content }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.validation).toBeDefined();
    expect(Array.isArray(json.validation.errors)).toBe(true);
    expect(Array.isArray(json.validation.suggestions)).toBe(true);
  });

  it("handles content with YAML frontmatter", async () => {
    const content = `---
version: "1.0"
---

## Build
\`\`\`bash
pnpm build
\`\`\`
`;
    const res = await POST(createRequest({ content }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.parsed).toBeDefined();
    // hasFrontmatter is true when frontmatter block exists and has keys
    expect(typeof json.parsed.hasFrontmatter).toBe("boolean");
  });
});
