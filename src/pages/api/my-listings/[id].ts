import type { APIRoute } from 'astro';
import { idempotencyKey } from '../../../lib/api/client';
import { runListingStep } from '../../../lib/api/listing-steps';
import { relay } from '../../../lib/api/relay';
import { isId } from '../../../lib/listing';
import { isListingStep } from '../../../lib/my-listings';

/** POST {step, price?, key?}: a step of Tin của bạn on the listing <id>, answered with the listing after it. */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id ?? '';
  const { step, price, key } = (await request.json().catch(() => ({}))) as { step?: string; price?: number; key?: string };
  if (!isId(id) || !step || !isListingStep(step) || (step === 'price' && typeof price !== 'number')) return new Response(null, { status: 400 });
  return relay(locals, () => runListingStep(locals.api, step, id, { price, key: key || idempotencyKey() }));
};
