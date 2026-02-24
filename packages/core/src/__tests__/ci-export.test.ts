import { describe, it, expect } from "vitest";
import { parseAgentsMd } from "../parser.js";
import { exportToGitHubActions } from "../ci-export.js";

describe("exportToGitHubActions", () => {
  it("generates valid workflow YAML", () => {
    const content = `## Build
\`pnpm run build\`

## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const yaml = exportToGitHubActions(parsed);
    expect(yaml).toContain("name: AgentMD");
    expect(yaml).toContain("on:");
    expect(yaml).toContain("push");
    expect(yaml).toContain("pull_request");
    expect(yaml).toContain("pnpm run build");
    expect(yaml).toContain("pnpm test");
  });

  it("includes working-directory when context present", () => {
    const content = `## Build
In packages/core run \`pnpm run build\`
`;
    const parsed = parseAgentsMd(content);
    const yaml = exportToGitHubActions(parsed);
    expect(yaml).toContain("working-directory");
    expect(yaml).toContain("packages/core");
  });

  it("excludes unsafe commands by default", () => {
    const content = "## Bad\n`rm -rf /`\n## Good\n`pnpm test`";
    const parsed = parseAgentsMd(content);
    const yaml = exportToGitHubActions(parsed);
    expect(yaml).not.toContain("rm -rf");
    expect(yaml).toContain("pnpm test");
  });

  it("respects ExportOptions", () => {
    const content = "## Test\n`pnpm test`";
    const parsed = parseAgentsMd(content);
    const yaml = exportToGitHubActions(parsed, {
      name: "Custom Workflow",
      jobName: "agentmd-test",
      runsOn: "ubuntu-22.04",
    });
    expect(yaml).toContain("name: Custom Workflow");
    expect(yaml).toContain("agentmd-test:");
    expect(yaml).toContain("ubuntu-22.04");
  });

  it("includes unsafe commands when safeOnly=false", () => {
    const content = "## Bad\n`rm -rf /`\n## Good\n`pnpm test`";
    const parsed = parseAgentsMd(content);
    const yaml = exportToGitHubActions(parsed, { safeOnly: false });
    expect(yaml).toContain("rm -rf");
    expect(yaml).toContain("pnpm test");
  });
});
