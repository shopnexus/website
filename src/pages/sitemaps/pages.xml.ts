import type { APIRoute } from 'astro';
import { categories } from '../../lib/catalog';
import { R } from '../../lib/routes';
import { STATIC_PAGES } from '../../lib/seo';
import { urlset } from '../../lib/sitemap';

/** The fixed public pages and each category. */
export const GET: APIRoute = async ({ url }) => {
  const cats = await categories();
  return urlset([...STATIC_PAGES, ...cats.map((c) => R.category(c.code))].map((path) => ({ path })), url);
};
