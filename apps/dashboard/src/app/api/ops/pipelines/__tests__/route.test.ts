import { describe, it, expect, vi } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/auth/session", () => ({
  requireSessionUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

describe("GET /api/ops/pipelines", () => {
  it("returns pipelines", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.pipelines).toBeDefined();
    expect(Array.isArray(json.pipelines)).toBe(true);
    expect(json.pipelines.length).toBeGreaterThan(0);
    expect(json.pipelines[0]).toHaveProperty("id");
    expect(json.pipelines[0]).toHaveProperty("stages");
    expect(json.pipelines[0]).toHaveProperty("status");
  });
});
