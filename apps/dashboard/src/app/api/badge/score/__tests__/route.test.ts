import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";
import { GET } from "../route";

function createRequest(url: string): NextRequest {
  return new Request(url, { method: "GET" }) as unknown as NextRequest;
}

describe("GET /api/badge/score", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 with SVG when score param is provided", async () => {
    const res = await GET(createRequest("http://localhost/api/badge/score?score=87"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(res.headers.get("Cache-Control")).toContain("max-age=300");
    const text = await res.text();
    expect(text).toContain("<svg");
    expect(text).toContain("87/100");
    expect(text).toContain("#16a34a"); // green for >= 80
  });

  it("clamps score to 0-100", async () => {
    const resHigh = await GET(createRequest("http://localhost/api/badge/score?score=150"));
    const textHigh = await resHigh.text();
    expect(textHigh).toContain("100/100");

    const resLow = await GET(createRequest("http://localhost/api/badge/score?score=-10"));
    const textLow = await resLow.text();
    expect(textLow).toContain("0/100");
  });

  it("uses amber color for score 50-79", async () => {
    const res = await GET(createRequest("http://localhost/api/badge/score?score=65"));
    const text = await res.text();
    expect(text).toContain("#d97706");
    expect(text).toContain("65/100");
  });

  it("uses red color for score below 50", async () => {
    const res = await GET(createRequest("http://localhost/api/badge/score?score=30"));
    const text = await res.text();
    expect(text).toContain("#dc2626");
    expect(text).toContain("30/100");
  });

  it("returns score 0 when no score or repo param", async () => {
    const res = await GET(createRequest("http://localhost/api/badge/score"));
    const text = await res.text();
    expect(text).toContain("0/100");
  });

  it("returns score 0 when score param is invalid", async () => {
    const res = await GET(createRequest("http://localhost/api/badge/score?score=abc"));
    const text = await res.text();
    expect(text).toContain("0/100");
  });

  it("fetches from GitHub when repo param is valid", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(`## Build
\`\`\`bash
pnpm build
\`\`\`
`),
    });
    vi.stubGlobal("fetch", mockFetch);

    const res = await GET(
      createRequest("http://localhost/api/badge/score?repo=owner/repo")
    );
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/owner/repo/main/AGENTS.md",
      expect.objectContaining({
        headers: { "User-Agent": "AgentMD-Badge/1.0" },
      })
    );
    const text = await res.text();
    expect(text).toContain("<svg");
    expect(text).not.toContain("0/100"); // should have computed score
  });

  it("returns score 0 when repo fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const res = await GET(
      createRequest("http://localhost/api/badge/score?repo=owner/nonexistent")
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("0/100");
  });

  it("returns score 0 when repo param is malformed", async () => {
    const res = await GET(
      createRequest("http://localhost/api/badge/score?repo=invalid-repo-format")
    );
    const text = await res.text();
    expect(text).toContain("0/100");
  });
});
