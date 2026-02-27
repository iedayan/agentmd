import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

const { getToken } = await import("next-auth/jwt");

async function loadMiddleware() {
  const mod = await import("../middleware");
  return mod.middleware;
}

function createNextRequest(url: string): NextRequest {
  const req = new NextRequest(url);
  return req;
}

describe("Auth middleware", () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReset();
  });

  it("redirects unauthenticated users from /dashboard to /register", async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const middleware = await loadMiddleware();
    const req = createNextRequest("http://localhost/dashboard");

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/register");
    expect(res.headers.get("location")).toContain("callbackUrl=%2Fdashboard");
  });

  it("allows authenticated users to access /dashboard", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as { sub: string });

    const middleware = await loadMiddleware();
    const req = createNextRequest("http://localhost/dashboard");

    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("redirects authenticated users from /register to /dashboard", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as { sub: string });

    const middleware = await loadMiddleware();
    const req = createNextRequest("http://localhost/register");

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("allows unauthenticated users to access /marketplace/developers/generator", async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const middleware = await loadMiddleware();
    const req = createNextRequest("http://localhost/marketplace/developers/generator");

    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("redirects unauthenticated users from /marketplace to /register", async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const middleware = await loadMiddleware();
    const req = createNextRequest("http://localhost/marketplace");

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/register");
  });
});
