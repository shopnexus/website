import type { APIRoute } from 'astro';
import { unwrap } from '../../lib/api/client';
import { relay } from '../../lib/api/relay';
import { isId } from '../../lib/listing';

/** POST {photo, key}: starts the AI's read of the cover photo; the read, reading. */
export const POST: APIRoute = async ({ request, locals }) => {
  const { photo, key } = (await request.json().catch(() => ({}))) as { photo?: string; key?: string };
  if (!photo || !isId(photo) || !key || !isId(key)) return new Response(null, { status: 400 });
  return relay(locals, () =>
    unwrap(locals.api.POST('/v1/listing-reads', { params: { header: { 'Idempotency-Key': key } }, body: { photo } })),
  );
};
