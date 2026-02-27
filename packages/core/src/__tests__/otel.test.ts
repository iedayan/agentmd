import { describe, it, expect } from "vitest";
import { toOtelTrace, toOtlpJson } from "../otel.js";
import type { ExecutionTraceContext } from "../otel.js";

const BASE_CTX: ExecutionTraceContext = {
  executionId: "12345678-1234-1234-1234-123456789abc",
  repositoryId: "repo-001",
  repositoryName: "my-repo",
  trigger: "push",
  status: "success",
  startedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
  completedAt: new Date("2024-01-01T00:01:00Z").toISOString(),
  durationMs: 60000,
  commandsRun: 3,
  commandsPassed: 3,
  commandsFailed: 0,
};

describe("toOtelTrace", () => {
  it("returns at least one root span", () => {
    const spans = toOtelTrace(BASE_CTX);
    expect(spans.length).toBeGreaterThanOrEqual(1);
  });

  it("root span has correct name", () => {
    const [root] = toOtelTrace(BASE_CTX);
    expect(root?.name).toBe("agentmd.execution");
  });

  it("root span carries execution attributes", () => {
    const [root] = toOtelTrace(BASE_CTX);
    expect(root?.attributes?.["agentmd.execution.id"]).toBe(BASE_CTX.executionId);
    expect(root?.attributes?.["agentmd.repository.name"]).toBe(BASE_CTX.repositoryName);
    expect(root?.attributes?.["agentmd.trigger"]).toBe("push");
    expect(root?.attributes?.["agentmd.commands.run"]).toBe(3);
  });

  it("root span status is OK (code 1) for successful execution", () => {
    const [root] = toOtelTrace(BASE_CTX);
    expect(root?.status?.code).toBe(1);
  });

  it("root span status is ERROR (code 2) for failed execution", () => {
    const [root] = toOtelTrace({ ...BASE_CTX, status: "failed" });
    expect(root?.status?.code).toBe(2);
    expect(root?.status?.message).toContain("failed");
  });

  it("generates child spans for each step", () => {
    const ctx: ExecutionTraceContext = {
      ...BASE_CTX,
      steps: [
        { id: "step-1111-1111-1111-111111111111", command: "pnpm install", type: "install", status: "success", durationMs: 1000 },
        { id: "step-2222-2222-2222-222222222222", command: "pnpm test", type: "test", status: "success", durationMs: 2000 },
      ],
    };
    const spans = toOtelTrace(ctx);
    // 1 root + 2 child spans
    expect(spans).toHaveLength(3);
  });

  it("child spans reference root as parent", () => {
    const ctx: ExecutionTraceContext = {
      ...BASE_CTX,
      steps: [
        { id: "step-1111-1111-1111-111111111111", command: "pnpm test", type: "test", status: "success" },
      ],
    };
    const spans = toOtelTrace(ctx);
    const [root, child] = spans;
    expect(child?.parentSpanId).toBe(root?.spanId);
  });

  it("child spans include command attributes", () => {
    const ctx: ExecutionTraceContext = {
      ...BASE_CTX,
      steps: [
        { id: "step-1111-1111-1111-111111111111", command: "pnpm test", type: "test", status: "failed", durationMs: 500 },
      ],
    };
    const spans = toOtelTrace(ctx);
    const child = spans[1];
    expect(child?.attributes?.["agentmd.command"]).toBe("pnpm test");
    expect(child?.attributes?.["agentmd.command.type"]).toBe("test");
    expect(child?.attributes?.["agentmd.step.status"]).toBe("failed");
    expect(child?.status?.code).toBe(2);
  });

  it("start and end nanoseconds are strings (BigInt serialization)", () => {
    const [root] = toOtelTrace(BASE_CTX);
    expect(typeof root?.startTimeUnixNano).toBe("string");
    expect(typeof root?.endTimeUnixNano).toBe("string");
  });

  it("handles missing completedAt gracefully", () => {
    const ctx = { ...BASE_CTX, completedAt: undefined };
    expect(() => toOtelTrace(ctx)).not.toThrow();
    const [root] = toOtelTrace(ctx);
    expect(root?.endTimeUnixNano).toBeDefined();
  });
});

describe("toOtlpJson", () => {
  it("wraps spans in OTLP resourceSpans structure", () => {
    const spans = toOtelTrace(BASE_CTX);
    const otlp = toOtlpJson(spans) as Record<string, unknown>;
    expect(otlp).toHaveProperty("resourceSpans");
    expect(Array.isArray(otlp["resourceSpans"])).toBe(true);
  });

  it("sets service.name attribute to agentmd", () => {
    const spans = toOtelTrace(BASE_CTX);
    const otlp = toOtlpJson(spans) as {
      resourceSpans: Array<{ resource: { attributes: Array<{ key: string; value: { stringValue?: string } }> } }>;
    };
    const attrs = otlp.resourceSpans[0]?.resource.attributes;
    const serviceName = attrs?.find((a) => a.key === "service.name");
    expect(serviceName?.value?.stringValue).toBe("agentmd");
  });

  it("includes all spans in scopeSpans", () => {
    const ctx: ExecutionTraceContext = {
      ...BASE_CTX,
      steps: [
        { id: "step-1111-1111-1111-111111111111", command: "pnpm test", type: "test", status: "success" },
      ],
    };
    const spans = toOtelTrace(ctx);
    const otlp = toOtlpJson(spans) as {
      resourceSpans: Array<{ scopeSpans: Array<{ spans: unknown[] }> }>;
    };
    const exportedSpans = otlp.resourceSpans[0]?.scopeSpans[0]?.spans;
    expect(exportedSpans).toHaveLength(spans.length);
  });
});

