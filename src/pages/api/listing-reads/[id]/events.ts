import type { APIRoute } from 'astro';
import { API_URL } from 'astro:env/server';
import { isId } from '../../../../lib/listing';

/** GET: the read's server-sent events, passed through: its text as the AI writes it, then the read. */
export const GET: APIRoute = async ({ params, locals, request }) => {
  const id = params.id ?? '';
  if (!isId(id)) return new Response(null, { status: 404 });
  const token = locals.session.token;
  if (!token) return new Response(null, { status: 401 });
  const res = await fetch(`${API_URL}/v1/listing-reads/${id}/events`, {
    headers: { authorization: `Bearer ${token}`, accept: 'text/event-stream' },
    signal: request.signal,
  }).catch(() => null);
  if (!res?.ok || !res.body) return new Response(null, { status: res?.status ?? 502 });
  return new Response(res.body, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', 'x-accel-buffering': 'no' },
  });
};
