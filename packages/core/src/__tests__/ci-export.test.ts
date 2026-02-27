import { describe, it, expect } from "vitest";
import { parseAgentsMd } from "../parser.js";
import { exportToGitHubActions } from "../ci-export.js";

describe("exportToGitHubActions", () => {
  it("generates valid workflow YAML", async () => {
    const content = `## Build
\`pnpm run build\`

## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const yaml = await exportToGitHubActions(parsed);
    expect(yaml).toContain("name: AgentMD");
    expect(yaml).toContain("on:");
    expect(yaml).toContain("push");
    expect(yaml).toContain("pull_request");
    expect(yaml).toContain("pnpm run build");
    expect(yaml).toContain("pnpm test");
  });

  it("includes working-directory when context present", async () => {
    const content = `## Build
In packages/core run \`pnpm run build\`
`;
    const parsed = parseAgentsMd(content);
    const yaml = await exportToGitHubActions(parsed);
    expect(yaml).toContain("working-directory");
    expect(yaml).toContain("packages/core");
  });

  it("excludes unsafe commands by default", async () => {
    const content = "## Bad\n`rm -rf /`\n## Good\n`pnpm test`";
    const parsed = parseAgentsMd(content);
    const yaml = await exportToGitHubActions(parsed);
    expect(yaml).not.toContain("rm -rf");
    expect(yaml).toContain("pnpm test");
  });

  it("respects ExportOptions", async () => {
    const content = "## Test\n`pnpm test`";
    const parsed = parseAgentsMd(content);
    const yaml = await exportToGitHubActions(parsed, {
      name: "Custom Workflow",
      jobName: "agentmd-test",
      runsOn: "ubuntu-22.04",
    });
    expect(yaml).toContain("name: Custom Workflow");
    expect(yaml).toContain("agentmd-test:");
    expect(yaml).toContain("ubuntu-22.04");
  });

  it("includes unsafe commands when safeOnly=false", async () => {
    const content = "## Bad\n`rm -rf /`\n## Good\n`pnpm test`";
    const parsed = parseAgentsMd(content);
    const yaml = await exportToGitHubActions(parsed, { safeOnly: false });
    expect(yaml).toContain("rm -rf");
    expect(yaml).toContain("pnpm test");
  });

  it("produces steps in install -> build -> test order", async () => {
    const content = `## Test
\`pnpm test\`
## Install
\`pnpm install\`
## Build
\`pnpm run build\`
`;
    const parsed = parseAgentsMd(content);
    const yaml = await exportToGitHubActions(parsed);
    const installIdx = yaml.indexOf("pnpm install");
    const buildIdx = yaml.indexOf("pnpm run build");
    const testIdx = yaml.indexOf("pnpm test");
    expect(installIdx).toBeLessThan(buildIdx);
    expect(buildIdx).toBeLessThan(testIdx);
  });

  it("uses workflow_dispatch trigger by default", async () => {
    const parsed = parseAgentsMd("## Test\n`pnpm test`");
    const yaml = await exportToGitHubActions(parsed);
    expect(yaml).toContain("workflow_dispatch");
  });

  it("respects custom on triggers", async () => {
    const parsed = parseAgentsMd("## Test\n`pnpm test`");
    const yaml = await exportToGitHubActions(parsed, { on: ["push"] });
    expect(yaml).toContain("push");
    expect(yaml).not.toContain("pull_request");
    expect(yaml).not.toContain("workflow_dispatch");
  });

  it("uses ubuntu-latest runner by default", async () => {
    const parsed = parseAgentsMd("## Test\n`pnpm test`");
    const yaml = await exportToGitHubActions(parsed);
    expect(yaml).toContain("ubuntu-latest");
  });

  it("produces empty steps when all commands are unsafe and safeOnly=true", async () => {
    const parsed = parseAgentsMd("## Bad\n`rm -rf /`");
    const yaml = await exportToGitHubActions(parsed, { safeOnly: true });
    expect(yaml).not.toContain("rm -rf");
    expect(yaml).toContain("steps:");
  });

  it("includes command type in step name", async () => {
    const parsed = parseAgentsMd("## Test\n`pnpm test`");
    const yaml = await exportToGitHubActions(parsed);
    expect(yaml).toContain("(test)");
  });
});
