import { describe, it, expect } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from '../route';

function createRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  return new Request('http://localhost/api/preflight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('POST /api/preflight', () => {
  it('returns 400 when body is not valid JSON', async () => {
    const req = new Request('http://localhost/api/preflight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('JSON');
  });

  it('returns 200 with allowed: true for minimal valid body', async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.allowed).toBe(true);
  });

  it('returns 200 or 403 for full valid body (depends on governance state)', async () => {
    const res = await POST(
      createRequest({
        repositoryId: 'ext',
        repositoryName: 'external/repo',
        requestedBy: 'api_user',
        agentId: 'build',
        agentsMdUrl: 'https://github.com/owner/repo/blob/main/AGENTS.md',
        trigger: 'manual',
      }),
    );
    expect([200, 403]).toContain(res.status);
    const json = await res.json();
    expect(json.ok).toBeDefined();
    if (res.status === 200) expect(json.allowed).toBe(true);
  });

  it('returns 400 when agentsMdUrl is invalid URL', async () => {
    const res = await POST(
      createRequest({
        agentsMdUrl: 'not-a-valid-url',
      }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it('accepts empty agentsMdUrl', async () => {
    const res = await POST(
      createRequest({
        repositoryId: 'ext',
        agentsMdUrl: '',
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.allowed).toBe(true);
  });
});
