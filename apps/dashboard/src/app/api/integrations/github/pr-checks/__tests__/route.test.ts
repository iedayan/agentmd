import { describe, expect, it, vi } from "vitest";
import { POST } from "../route";

vi.mock("@/lib/auth/session", () => ({
  requireSessionUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

function createRequest(body: unknown) {
  return new Request("http://localhost/api/integrations/github/pr-checks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/integrations/github/pr-checks", () => {
  it("returns 400 for missing fields", async () => {
    const res = await POST(
      createRequest({ repositoryId: "1" }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("MISSING_FIELDS");
  });

  it("updates check statuses and returns gate summary", async () => {
    const res = await POST(
      createRequest({
        repositoryId: "1",
        pullRequestNumber: 42,
        checks: {
          "agentmd/parse": "success",
          "agentmd/policy-gate": "success",
          "agentmd/execution-ready": "success",
        },
      }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(typeof json.gatePass).toBe("boolean");
    expect(json.summary).toContain("AgentMD merge gate report");
    expect(json.gateDecision).toBeDefined();
  });

  it("returns 404 for unknown repository", async () => {
    const res = await POST(
      createRequest({
        repositoryId: "does-not-exist",
        pullRequestNumber: 10,
        checks: { "agentmd/parse": "success" },
      }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.code).toBe("REPOSITORY_NOT_FOUND");
  });

  it("returns 400 for invalid check status", async () => {
    const res = await POST(
      createRequest({
        repositoryId: "1",
        pullRequestNumber: 12,
        checks: { "agentmd/parse": "green" },
      }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_STATUS");
  });

  it("reports missing token when postComment is requested", async () => {
    delete process.env.GITHUB_TOKEN;
    const res = await POST(
      createRequest({
        repositoryId: "1",
        pullRequestNumber: 77,
        checks: { "agentmd/parse": "success" },
        postComment: true,
      }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.comment.attempted).toBe(true);
    expect(json.comment.posted).toBe(false);
    expect(String(json.comment.reason)).toContain("missing");
  });

  it("includes contract failures and remediation guidance", async () => {
    const res = await POST(
      createRequest({
        repositoryId: "1",
        pullRequestNumber: 78,
        checks: { "agentmd/parse": "success" },
        contract: {
          type: "bugfix",
          errors: [
            {
              code: "MISSING_OUTPUT_CONTRACT",
              message: "frontmatter.output_contract is required",
            },
            {
              code: "OUTPUT_QUALITY_GATE_FAILED",
              message: "Output quality gate did not pass: tests_pass",
            },
          ],
        },
      }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.contract.status).toBe("failed");
    expect(json.contract.type).toBe("bugfix");
    expect(json.summary).toContain("Contract validation issues:");
    expect(json.summary).toContain("Suggested fixes:");
    expect(Array.isArray(json.events)).toBe(true);
    expect(json.events.some((event: { type: string }) => event.type === "contract.failed")).toBe(
      true
    );
  });

  it("returns 409 when enforceMergeGate is enabled and gate is blocked", async () => {
    const res = await POST(
      createRequest({
        repositoryId: "1",
        pullRequestNumber: 79,
        checks: {
          "agentmd/parse": "success",
          "agentmd/policy-gate": "pending",
        },
        enforceMergeGate: true,
      }) as unknown as import("next/server").NextRequest
    );
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.code).toBe("MERGE_BLOCKED");
    expect(json.details).toBeDefined();
    expect(json.details.gatePass).toBe(false);
  });
});
