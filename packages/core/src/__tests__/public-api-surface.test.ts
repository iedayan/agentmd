import { describe, expect, it } from "vitest";
import * as core from "../index.js";

const STABLE_EXPORTS = [
  "parseAgentsMd",
  "findSection",
  "extractCommands",
  "getSuggestedExecutionOrder",
  "validateAgentsMd",
  "computeAgentReadinessScore",
  "discoverAgentsMd",
  "findNearestAgentsMd",
  "parseFrontmatter",
  "parseDirectives",
  "getDirectiveTarget",
  "getDirectivePriority",
  "discoverFragments",
  "loadComposeConfig",
  "composeAgentsMd",
  "exportToGitHubActions",
  "isCommandSafe",
  "isCommandAllowed",
  "requiresShellFeatures",
  "planCommandExecutions",
  "executeCommand",
  "executeCommands",
  "executeCommandsParallel",
  "computeTrustScore",
  "isCertified",
  "SECURITY_CHECKLIST",
] as const;

describe("public API surface", () => {
  it("contains the documented stable exports", () => {
    for (const key of STABLE_EXPORTS) {
      expect(core[key]).toBeDefined();
    }
  });
});
