import { getPublicAppUrl } from '@/lib/core/public-url';

export interface OgImageParams {
  title: string;
  description?: string;
  score?: number;
  site?: string;
}

/**
 * Build the URL for a dynamically generated OG image.
 * Use in generateMetadata: openGraph: { images: [{ url: buildOgUrl({ ... }) }] }
 */
export function buildOgUrl(params: OgImageParams): string {
  const baseUrl = getPublicAppUrl();
  const searchParams = new URLSearchParams();
  searchParams.set('title', params.title);
  if (params.description) searchParams.set('description', params.description);
  if (params.score != null) searchParams.set('score', String(params.score));
  if (params.site) searchParams.set('site', params.site);
  return `${baseUrl}/api/og?${searchParams.toString()}`;
}
