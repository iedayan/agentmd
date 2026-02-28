import { describe, expect, it, vi } from 'vitest';
import { GET } from '../route';

vi.mock('@/lib/auth/session', () => ({
  requireSessionUserId: vi.fn().mockResolvedValue('test-user-id'),
}));

describe('GET /api/analytics/roi-report', () => {
  it('returns ROI report with value metrics', async () => {
    const req = new Request(
      'http://localhost/api/analytics/roi-report?days=30&hourlyRateUsd=150&incidentCostUsd=2000',
    );
    const res = await GET(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.value).toBeDefined();
    expect(typeof json.value.netValueUsd).toBe('number');
    expect(typeof json.metrics.executionsAnalyzed).toBe('number');
  });

  it('clamps out-of-range query params to safe bounds', async () => {
    const req = new Request(
      'http://localhost/api/analytics/roi-report?days=9999&hourlyRateUsd=9999&incidentCostUsd=1&baselineFailureRate=9&platformCostMonthlyUsd=-10',
    );
    const res = await GET(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.periodDays).toBe(365);
    expect(json.assumptions.hourlyRateUsd).toBe(500);
    expect(json.assumptions.incidentCostUsd).toBe(200);
    expect(json.assumptions.baselineFailureRate).toBe(95);
    expect(json.assumptions.platformCostMonthlyUsd).toBe(0);
  });

  it('includes confidence level', async () => {
    const req = new Request('http://localhost/api/analytics/roi-report?days=30');
    const res = await GET(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(['low', 'medium', 'high']).toContain(json.confidence);
  });
});
