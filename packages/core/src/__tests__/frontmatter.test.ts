import { describe, it, expect } from "vitest";
import { parseAgentsMd } from "../parser.js";
import { parseFrontmatter, stringifyAgentsMd } from "../frontmatter.js";

const WITH_FRONTMATTER = `---
agent:
  name: pr-labeler
  purpose: "Apply size labels to PRs"
  model: gpt-4o-mini
  triggers:
    - pull_request.opened
  permissions:
    pull_requests: write
  guardrails:
    - "Never modify code, never merge"
---

# Project

## Testing
Run \`pnpm test\`.
`;

describe("frontmatter parsing", () => {
  it("extracts agent frontmatter", () => {
    const parsed = parseAgentsMd(WITH_FRONTMATTER);
    expect(parsed.frontmatter).toBeDefined();
    expect(parsed.frontmatter?.name).toBe("pr-labeler");
    expect(parsed.frontmatter?.purpose).toContain("Apply size labels");
    expect(parsed.frontmatter?.model).toBe("gpt-4o-mini");
    expect(parsed.frontmatter?.triggers).toContain("pull_request.opened");
    expect(parsed.frontmatter?.guardrails).toContain("Never modify code, never merge");
  });

  it("parses body without frontmatter", () => {
    const parsed = parseAgentsMd(WITH_FRONTMATTER);
    expect(parsed.body).toContain("# Project");
    expect(parsed.sections.length).toBeGreaterThanOrEqual(1);
  });

  it("parses flat frontmatter without agent wrapper", () => {
    const flat = `---
name: flat-agent
purpose: "Flat config"
model: gpt-4
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(flat);
    expect(parsed.frontmatter?.name).toBe("flat-agent");
    expect(parsed.frontmatter?.purpose).toBe("Flat config");
    expect(parsed.frontmatter?.model).toBe("gpt-4");
  });

  it("preserves metadata object", () => {
    const withMeta = `---
agent:
  name: x
  metadata:
    version: "1.0"
    env: prod
---
## Test
`;
    const parsed = parseAgentsMd(withMeta);
    expect(parsed.frontmatter?.metadata?.version).toBe("1.0");
    expect(parsed.frontmatter?.metadata?.env).toBe("prod");
  });

  it("stringifyAgentsMd round-trips frontmatter and body", () => {
    const body = "## Build\n`pnpm build`";
    const frontmatter = { name: "my-agent", purpose: "Build and test" };
    const out = stringifyAgentsMd(body, frontmatter);
    const { frontmatter: fm, body: b } = parseFrontmatter(out);
    expect(fm.name).toBe("my-agent");
    expect(fm.purpose).toBe("Build and test");
    expect(b.trim()).toBe(body);
  });

  it("parses commands schema with risk_level, preconditions, audit_tags", () => {
    const withCommands = `---
agent:
  name: deploy-agent
  commands:
    "pnpm run deploy":
      risk_level: dangerous
      preconditions: ["tests pass", "approval"]
      audit_tags: [deploy, production]
    "pnpm test":
      risk_level: safe
---
## Build
\`pnpm build\`
`;
    const parsed = parseAgentsMd(withCommands);
    expect(parsed.frontmatter?.commands).toBeDefined();
    const deployMeta = parsed.frontmatter?.commands?.["pnpm run deploy"];
    expect(deployMeta?.risk_level).toBe("dangerous");
    expect(deployMeta?.preconditions).toEqual(["tests pass", "approval"]);
    expect(deployMeta?.audit_tags).toEqual(["deploy", "production"]);
    expect(parsed.frontmatter?.commands?.["pnpm test"]?.risk_level).toBe("safe");
  });

  it("parses output_contract in frontmatter", () => {
    const withContract = `---
output_contract:
  format: json
  schema:
    summary: string
    files_changed: array
  quality_gates:
    - tests_pass
  artifacts:
    - patches
  exit_criteria:
    - complete
---
## Build
\`pnpm build\`
`;
    const parsed = parseAgentsMd(withContract);
    expect(parsed.frontmatter?.output_contract).toBeDefined();
    expect(parsed.frontmatter?.output_contract?.format).toBe("json");
    expect(parsed.frontmatter?.output_contract?.schema.summary).toBe("string");
    expect(parsed.frontmatter?.output_contract?.quality_gates).toContain("tests_pass");
  });
});
