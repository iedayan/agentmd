import { describe, expect, it, vi } from 'vitest';
import { GET } from '../route';

vi.mock('@/lib/auth/session', () => ({
  requireSessionUserId: vi.fn().mockResolvedValue('test-user-id'),
}));

describe('GET /api/analytics/overview', () => {
  it('returns analytics overview with trend and kpis', async () => {
    const res = await GET(
      new Request(
        'http://localhost/api/analytics/overview',
      ) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.trend)).toBe(true);
    expect(json.trend.length).toBe(14);
    expect(json.kpis).toBeDefined();
    expect(typeof json.kpis.roiMultiple).toBe('number');
    expect(json.governance).toBeDefined();
  });
});
