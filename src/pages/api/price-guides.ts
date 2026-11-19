import type { APIRoute } from 'astro';
import { type Schemas, unwrap } from '../../lib/api/client';
import { relay } from '../../lib/api/relay';

/** POST the draft's pricing fields (PriceGuideRequest): the price guide. */
export const POST: APIRoute = async ({ request, locals }) => {
  const body = (await request.json().catch(() => null)) as Schemas['PriceGuideRequest'] | null;
  if (!body?.title || !body.category_code || !body.condition || !body.commune_code) return new Response(null, { status: 400 });
  return relay(locals, () => unwrap(locals.api.POST('/v1/price-guides', { body })));
};
