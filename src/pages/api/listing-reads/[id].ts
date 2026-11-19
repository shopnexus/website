import type { APIRoute } from 'astro';
import { unwrap } from '../../../lib/api/client';
import { relay } from '../../../lib/api/relay';
import { isId } from '../../../lib/listing';

/** GET: the read as it is now. */
export const GET: APIRoute = async ({ params, locals }) => {
  const id = params.id ?? '';
  if (!isId(id)) return new Response(null, { status: 404 });
  return relay(locals, () => unwrap(locals.api.GET('/v1/listing-reads/{id}', { params: { path: { id } } })));
};
