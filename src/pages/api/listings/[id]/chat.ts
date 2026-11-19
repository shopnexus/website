import type { APIRoute } from 'astro';
import { ApiError, idempotencyKey, unwrap } from '../../../../lib/api/client';
import { isId } from '../../../../lib/listing';
import { openDeal } from '../../../../lib/messages';

/**
 * Chat nhanh on a listing. POST {text, key}: a message; {amount}: an offer.
 * Both open the buyer's deal first, which opens the chat. The answer is
 * {chat, deal}; a refusal is its status with {code}.
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session.token) return new Response(null, { status: 401 });
  const id = params.id ?? '';
  if (!isId(id)) return new Response(null, { status: 404 });
  const { text, key, amount } = (await request.json().catch(() => ({}))) as { text?: string; key?: string; amount?: number };
  const api = locals.api;
  try {
    const d = await openDeal(api, id);
    if (typeof amount === 'number') {
      await unwrap(api.POST('/v1/deals/{id}/offer', { params: { path: { id: d.id } }, body: { amount } }));
    } else if (text?.trim()) {
      await unwrap(
        api.POST('/v1/conversations/{id}/messages', {
          params: { path: { id: d.conversation_id }, header: { 'Idempotency-Key': key || idempotencyKey() } },
          body: { text: text.trim(), listing_id: id },
        }),
      );
    }
    return Response.json({ chat: d.conversation_id, deal: d.id });
  } catch (e) {
    if (e instanceof ApiError) return Response.json({ code: e.code }, { status: e.status });
    return new Response(null, { status: 502 });
  }
};
