import { describe, expect, it, vi } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/auth/session", () => ({
  requireSessionUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

describe("GET /api/ops/slo", () => {
  it("returns SLO objectives and reliability metrics", async () => {
    const res = await GET(
      new Request("http://localhost/api/ops/slo") as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.objectives)).toBe(true);
    expect(json.metrics).toBeDefined();
    expect(["healthy", "degraded"]).toContain(json.status);
    const ids = (json.objectives as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toContain("webhook-success-rate");
    expect(ids).toContain("duplicate-delivery-rate");
    expect(ids).toContain("approval-latency-p95");
    expect(ids).toContain("open-incidents");
  });
});
