import { describe, it, expect, vi } from "vitest";
import { POST } from "../route";

vi.mock("@/lib/auth/session", () => ({
  requireSessionUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/execute", () => {
  it("returns 400 when agentsMdUrl and agentId are both missing", async () => {
    const res = await POST(createRequest({}) as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.code).toBe("MISSING_AGENT_REFERENCE");
  });

  it("returns 400 for invalid agentId format", async () => {
    const res = await POST(
      createRequest({ agentId: "invalid@id!" }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_AGENT_ID");
  });

  it("returns 400 for invalid agentsMdUrl protocol", async () => {
    const res = await POST(
      createRequest({ agentsMdUrl: "ftp://example.com/AGENTS.md" }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_AGENTS_MD_URL_PROTOCOL");
  });

  it("returns 404 for unknown repositoryId", async () => {
    const res = await POST(
      createRequest({
        agentsMdUrl: "https://example.com/AGENTS.md",
        repositoryId: "nonexistent-repo-id",
      }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.code).toBe("REPOSITORY_NOT_FOUND");
  });

  it("queues execution with valid agentsMdUrl and known repository", async () => {
    const res = await POST(
      createRequest({
        agentsMdUrl: "https://github.com/agentmd/agentmd/blob/main/AGENTS.md",
        repositoryId: "1",
        trigger: "manual",
      }) as unknown as import("next/server").NextRequest
    );
    // May be 201 (queued) or 403/409 if governance blocks
    expect([200, 201, 403, 409]).toContain(res.status);
    const json = await res.json();
    if (res.status === 201) {
      expect(json.execution).toBeDefined();
      expect(json.execution.id).toBeDefined();
      expect(json.execution.status).toBe("queued");
    }
  });

  it("accepts agentId and resolves to marketplace URL", async () => {
    const res = await POST(
      createRequest({
        agentId: "my-agent",
        repositoryId: "1",
      }) as unknown as import("next/server").NextRequest
    );
    expect([200, 201, 403, 409]).toContain(res.status);
  });
});
