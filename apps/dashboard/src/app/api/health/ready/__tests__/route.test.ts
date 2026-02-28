import { describe, it, expect } from 'vitest';
import type { NextRequest } from 'next/server';
import { GET } from '../route';

function createRequest(url = 'http://localhost/api/health/ready'): NextRequest {
  return new Request(url, { method: 'GET' }) as unknown as NextRequest;
}

describe('GET /api/health/ready', () => {
  it('returns 200 or 503 with expected structure', async () => {
    const res = await GET(createRequest());
    expect([200, 503]).toContain(res.status);
    const json = await res.json();

    if (res.status === 200) {
      expect(json.ok).toBe(true);
      expect(json.status).toBe('ready');
      expect(json.checks).toBeDefined();
    } else {
      expect(json.ok).toBe(false);
      expect(json.error).toBeDefined();
      expect(typeof json.error).toBe('string');
      expect(json.code).toBeDefined();
    }
  });
});
