import { describe, expect, it } from "vitest";
import { parseAgentsMd } from "../parser.js";
import { validateOutputAgainstContract } from "../output-contract.js";

const WITH_CONTRACT = `---
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
## Test
\`pnpm test\`
`;

describe("validateOutputAgainstContract", () => {
  it("passes when output matches contract", () => {
    const parsed = parseAgentsMd(WITH_CONTRACT);
    const output = JSON.stringify({
      summary: "done",
      files_changed: ["a.ts"],
      quality_gates: { tests_pass: true },
      artifacts: ["patches"],
      exit_criteria: { complete: true },
    });
    const result = validateOutputAgainstContract(parsed, output);
    expect(result.valid).toBe(true);
  });

  it("fails on schema mismatch and failed gates", () => {
    const parsed = parseAgentsMd(WITH_CONTRACT);
    const output = JSON.stringify({
      summary: 42,
      quality_gates: { tests_pass: false },
      artifacts: [],
      exit_criteria: { complete: false },
    });
    const result = validateOutputAgainstContract(parsed, output);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "OUTPUT_SCHEMA_TYPE_MISMATCH")).toBe(true);
    expect(result.errors.some((e) => e.code === "OUTPUT_QUALITY_GATE_FAILED")).toBe(true);
    expect(result.errors.some((e) => e.code === "OUTPUT_ARTIFACT_MISSING")).toBe(true);
    expect(result.errors.some((e) => e.code === "OUTPUT_EXIT_CRITERIA_UNMET")).toBe(true);
  });
});
