import { describe, it, expect, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from '../route';

function createRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  const unique = `test-sandbox-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Request('http://localhost/api/demo/sandbox', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': unique,
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('POST /api/demo/sandbox', () => {
  beforeEach(() => {
    // Use unique x-forwarded-for per test to avoid rate limit collisions
  });

  it('returns 400 when neither url nor content provided', async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBeDefined();
  });

  it('returns 400 when content is empty string', async () => {
    const res = await POST(createRequest({ content: '' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it('returns 400 when content exceeds 50k chars', async () => {
    const res = await POST(createRequest({ content: 'x'.repeat(50_001) }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('50,000');
  });

  it('returns 400 when url is from disallowed host', async () => {
    const res = await POST(createRequest({ url: 'https://evil.com/path/to/file.md' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('GitHub, GitLab, or Bitbucket');
  });

  it('parses valid content and returns parsed result with score', async () => {
    const content = `## Build
\`\`\`bash
pnpm run build
\`\`\`

## Test
\`\`\`bash
pnpm run test
\`\`\`
`;
    const res = await POST(createRequest({ content }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.parsed).toBeDefined();
    expect(json.parsed.sections).toBeDefined();
    expect(Array.isArray(json.parsed.sections)).toBe(true);
    expect(json.parsed.commands).toBeDefined();
    expect(json.validation).toBeDefined();
    expect(typeof json.score).toBe('number');
    expect(json.score).toBeGreaterThanOrEqual(0);
    expect(json.score).toBeLessThanOrEqual(100);
  });

  it('returns X-RateLimit-Remaining header on success', async () => {
    const res = await POST(createRequest({ content: '## Build\n```bash\necho ok\n```' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
  });
});
