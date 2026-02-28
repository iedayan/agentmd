import { describe, expect, it, vi } from 'vitest';
import { GET } from '../route';
import { recordContractValidationResult } from '@/lib/analytics/governance-data';

vi.mock('@/lib/auth/session', () => ({
  requireSessionUserId: vi.fn().mockResolvedValue('test-user-id'),
}));

describe('GET /api/analytics/contracts', () => {
  it('returns contract analytics grouped by type', async () => {
    recordContractValidationResult({ contractType: 'bugfix', status: 'success' });
    recordContractValidationResult({ contractType: 'bugfix', status: 'failed' });
    recordContractValidationResult({ contractType: 'migration', status: 'success' });

    const res = await GET(
      new Request(
        'http://localhost/api/analytics/contracts?days=30',
      ) as unknown as import('next/server').NextRequest,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.days).toBe(30);
    expect(Array.isArray(json.byType)).toBe(true);
    expect(
      json.byType.some((item: { contractType: string }) => item.contractType === 'bugfix'),
    ).toBe(true);
    expect(json.totals.total).toBeGreaterThanOrEqual(3);
    expect(Array.isArray(json.trend)).toBe(true);
  });
});
