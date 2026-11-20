import type { APIRoute } from 'astro';
import { apiClient, orNull } from '../../../lib/api/client';
import { isId } from '../../../lib/listing';
import { R } from '../../../lib/routes';
import { PART_KINDS, type PartKind, urlset } from '../../../lib/sitemap';

/** One part of the listings or the sellers, by the cursor /sitemap.xml gave it ("first" for none). */
export const GET: APIRoute = async ({ params, url }) => {
  const kind = params.kind as PartKind;
  const cursor = params.part === 'first' ? undefined : params.part;
  if (!PART_KINDS.includes(kind) || (cursor && !isId(cursor))) return new Response(null, { status: 404 });
  const query = { params: { query: { cursor } } };
  const api = apiClient();
  const entries =
    kind === 'listings'
      ? (await orNull(api.GET('/v1/sitemap/listings', query)))?.items.map((l) => ({ path: R.listing(l.slug), lastmod: l.updated_at }))
      : (await orNull(api.GET('/v1/sitemap/sellers', query)))?.items.map((s) => ({ path: R.seller(s.id), lastmod: s.updated_at }));
  return entries ? urlset(entries, url) : new Response(null, { status: 404 });
};
