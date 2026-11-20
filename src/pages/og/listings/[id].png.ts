import type { APIRoute } from 'astro';
import { apiClient, orNull } from '../../../lib/api/client';
import { isId } from '../../../lib/listing';
import { cardVersion } from '../../../lib/routes';
import { listingCard } from '../../../lib/og-card';

/** A public listing's share picture. ?v= names the listing's version, so a versioned address never changes. */
export const GET: APIRoute = async ({ params, url }) => {
  const id = params.id ?? '';
  const it = isId(id) ? await orNull(apiClient().GET('/v1/listings/{id}', { params: { path: { id } } })) : null;
  if (!it) return new Response(null, { status: 404 });
  const current = url.searchParams.get('v') === cardVersion(it.updated_at);
  return new Response(new Uint8Array(await listingCard(it)), {
    headers: { 'content-type': 'image/png', 'cache-control': current ? 'public, max-age=86400, immutable' : 'public, max-age=3600' },
  });
};
