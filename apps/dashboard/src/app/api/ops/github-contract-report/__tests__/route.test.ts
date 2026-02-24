import { describe, expect, it, vi } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/auth/session", () => ({
  requireSessionUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

describe("GET /api/ops/github-contract-report", () => {
  it("returns latest sync summary and non-success output contract repos", async () => {
    const res = await GET(
      new Request("http://localhost/api/ops/github-contract-report") as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.latestSync).toBeDefined();
    expect(json.latestSync).toHaveProperty("at");
    expect(json.latestSync).toHaveProperty("summary");
    expect(Array.isArray(json.nonSuccessOutputContract)).toBe(true);
    expect(json.totals).toBeDefined();
    expect(typeof json.totals.repositories).toBe("number");
    expect(typeof json.totals.failingOrPendingOutputContract).toBe("number");
    for (const item of json.nonSuccessOutputContract as Array<Record<string, unknown>>) {
      expect(item).toHaveProperty("repositoryId");
      expect(item).toHaveProperty("repositoryName");
      expect(item).toHaveProperty("status");
      expect(item).toHaveProperty("required", true);
      expect(item).toHaveProperty("decision");
    }
  });
});
