import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/auth/session", () => ({
  requireSessionUserId: vi.fn(),
}));

const { requireSessionUserId } = await import("@/lib/auth/session");

function createRequest(url = "http://localhost/api/repositories"): Request {
  return new Request(url, { method: "GET" });
}

describe("GET /api/repositories (auth-protected)", () => {
  beforeEach(() => {
    vi.mocked(requireSessionUserId).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireSessionUserId).mockRejectedValue(
      new Response(
        JSON.stringify({ ok: false, error: "Unauthorized. Please sign in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    );

    const res = await GET(createRequest() as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("sign in");
  });

  it("returns 200 with repositories when authenticated", async () => {
    vi.mocked(requireSessionUserId).mockResolvedValue("user-123");

    const res = await GET(createRequest() as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.repositories).toBeDefined();
    expect(Array.isArray(json.repositories)).toBe(true);
  });
});
