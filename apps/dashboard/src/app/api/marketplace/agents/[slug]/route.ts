import { getMarketplaceAgentBySlug } from '@/lib/data/dashboard-data';
import { apiError, apiOk, getRequestId } from '@/lib/core/api-response';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const requestId = getRequestId(req);
  const { slug } = await params;
  const agent = getMarketplaceAgentBySlug(slug);
  if (!agent) {
    return apiError('Not found', { status: 404, requestId });
  }
  return apiOk({ agent }, { requestId });
}
