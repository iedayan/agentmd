import { NextRequest } from 'next/server';
import { apiOk, getRequestId } from '@/lib/core/api-response';
import { getContractValidationAnalytics } from '@/lib/analytics/governance-data';
import { requireSessionUserId } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  try {
    await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }

  const searchParams =
    'nextUrl' in req && req.nextUrl ? req.nextUrl.searchParams : new URL(req.url).searchParams;
  const daysRaw = Number(searchParams.get('days') ?? 30);
  const days = Number.isFinite(daysRaw) ? Math.min(90, Math.max(1, Math.floor(daysRaw))) : 30;
  const analytics = getContractValidationAnalytics(days);

  return apiOk(
    {
      generatedAt: new Date().toISOString(),
      days,
      ...analytics,
    },
    { requestId },
  );
}
