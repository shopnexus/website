import type { APIRoute } from 'astro';
import { apiClient, unwrap } from '../lib/api/client';
import { PART_KINDS, partPath, sitemapIndex } from '../lib/sitemap';

/** The sitemap index: the fixed pages, then one file per part of the listings and of the sellers. */
export const GET: APIRoute = async ({ url }) => {
  const parts = await unwrap(apiClient().GET('/v1/sitemap'));
  return sitemapIndex(
    [
      { path: '/sitemaps/pages.xml' },
      ...PART_KINDS.flatMap((kind) => parts[kind].map((p) => ({ path: partPath(kind, p.cursor), lastmod: p.updated_at }))),
    ],
    url,
  );
};
