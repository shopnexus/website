import type { APIRoute } from 'astro';
import { isId } from '../../../lib/listing';
import { answerOffer } from '../../../lib/offers';

// Trả giá's answers in place: the row's form (do=accept|counter|decline)
// posts here and reads {} or {error: <code>}. A guest gets 401.
export const POST: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session.token) return new Response(null, { status: 401 });
  const deal = params.deal ?? '';
  if (!isId(deal)) return new Response(null, { status: 404 });
  const form = await request.formData();
  const error = await answerOffer(locals.api, deal, String(form.get('do') ?? ''), form);
  return Response.json(error ? { error } : {});
};
