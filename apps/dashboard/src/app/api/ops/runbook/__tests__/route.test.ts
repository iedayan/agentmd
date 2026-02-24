import { describe, expect, it, vi } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/auth/session", () => ({
  requireSessionUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

describe("GET /api/ops/runbook", () => {
  it("includes reliability and checks in response", async () => {
    const res = await GET(
      new Request("http://localhost/api/ops/runbook") as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(typeof json.generatedAt).toBe("string");
    expect(json.reliability).toBeDefined();
    expect(typeof json.reliability.duplicateRate).toBe("number");
    expect(Array.isArray(json.checks)).toBe(true);
    expect(Array.isArray(json.incidents)).toBe(true);
    expect(
      json.checks.some((check: { id?: string }) => check.id === "duplicate-delivery-rate")
    ).toBe(true);
  });
});
