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
    expect(result.errors).toHaveLength(0);
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

  it("fails when no output_contract in frontmatter", () => {
    const parsed = parseAgentsMd("## Test\n`pnpm test`");
    const result = validateOutputAgainstContract(parsed, "{}");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "MISSING_OUTPUT_CONTRACT")).toBe(true);
  });

  it("fails when output is not valid JSON", () => {
    const parsed = parseAgentsMd(WITH_CONTRACT);
    const result = validateOutputAgainstContract(parsed, "not json");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "INVALID_OUTPUT_JSON")).toBe(true);
  });

  it("fails when output is a JSON array instead of object", () => {
    const parsed = parseAgentsMd(WITH_CONTRACT);
    const result = validateOutputAgainstContract(parsed, "[1, 2, 3]");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "INVALID_OUTPUT_JSON")).toBe(true);
  });

  it("fails when required schema key is missing from output", () => {
    const parsed = parseAgentsMd(WITH_CONTRACT);
    const output = JSON.stringify({
      // summary is missing
      files_changed: ["a.ts"],
      quality_gates: { tests_pass: true },
      artifacts: ["patches"],
      exit_criteria: { complete: true },
    });
    const result = validateOutputAgainstContract(parsed, output);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "OUTPUT_SCHEMA_MISSING_KEY")).toBe(true);
  });

  it("warns when format is not json", () => {
    const content = `---
output_contract:
  format: markdown
  schema:
    summary: string
  quality_gates:
    - done
  artifacts:
    - report
  exit_criteria:
    - finished
---
## Test
\`pnpm test\`
`;
    const parsed = parseAgentsMd(content);
    const result = validateOutputAgainstContract(parsed, "## Summary\nDone");
    expect(result.warnings.some((w) => w.code === "OUTPUT_CONTRACT_FORMAT_UNCHECKED")).toBe(true);
  });

  it("passes when artifact found as object key", () => {
    const parsed = parseAgentsMd(WITH_CONTRACT);
    const output = JSON.stringify({
      summary: "done",
      files_changed: ["a.ts"],
      quality_gates: { tests_pass: true },
      artifacts: { patches: "path/to/patches" },
      exit_criteria: { complete: true },
    });
    const result = validateOutputAgainstContract(parsed, output);
    expect(result.valid).toBe(true);
  });
});
