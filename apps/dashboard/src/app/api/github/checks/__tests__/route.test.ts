import { describe, expect, it } from 'vitest';
import { POST } from '../route';

function createRequest(body: unknown) {
  return new Request('http://localhost/api/github/checks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/github/checks', () => {
  it('returns 400 when repositoryId is missing', async () => {
    const res = await POST(
      createRequest({
        checkName: 'agentmd/parse',
        status: 'success',
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('MISSING_FIELDS');
  });

  it('updates required checks', async () => {
    const res = await POST(
      createRequest({
        repositoryId: '1',
        requiredChecks: ['agentmd/parse', 'agentmd/policy-gate', 'agentmd/execution-ready'],
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.gate.requiredChecks)).toBe(true);
    expect(json.gate.requiredChecks).toContain('agentmd/output-contract');
  });

  it('auto-includes output-contract check when required checks update is empty', async () => {
    const res = await POST(
      createRequest({
        repositoryId: '1',
        requiredChecks: [''],
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.gate.requiredChecks).toContain('agentmd/output-contract');
  });

  it('updates check status', async () => {
    const res = await POST(
      createRequest({
        repositoryId: '1',
        checkName: 'agentmd/parse',
        status: 'success',
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.gate.checks['agentmd/parse']).toBe('success');
    expect(json.decision).toBeDefined();
    expect(typeof json.decision.pass).toBe('boolean');
  });

  it('returns 400 for invalid check status', async () => {
    const res = await POST(
      createRequest({
        repositoryId: '1',
        checkName: 'agentmd/parse',
        status: 'green',
      }) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_STATUS');
  });
});
