import type { APIRoute } from 'astro';
import { PRIVATE } from '../lib/seo';

/** robots.txt for whichever host serves the site. */
export const GET: APIRoute = ({ url }) =>
  new Response(['User-agent: *', ...PRIVATE.map((p) => `Disallow: ${p}`), '', `Sitemap: ${new URL('/sitemap.xml', url).href}`, ''].join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
