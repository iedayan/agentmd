import type { MetadataRoute } from 'next';
import { getPublicAppUrl } from '@/lib/core/public-url';

const appUrl = getPublicAppUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
