import { describe, expect, it } from "vitest";
import { parseAgentsMd, validateAgentsMd } from "../index.js";

describe("@agentmd/sdk", () => {
  it("re-exports parser and validator", async () => {
    const parsed = parseAgentsMd(
      [
        "---",
        "agent:",
        "  name: test-agent",
        "---",
        "",
        "## Test",
        "",
        "```bash",
        "pnpm test",
        "```",
        "",
      ].join("\n")
    );

    const result = await validateAgentsMd(parsed);
    expect(parsed.commands.some((cmd) => cmd.command === "pnpm test")).toBe(true);
    expect(result.valid).toBe(true);
  });
});
