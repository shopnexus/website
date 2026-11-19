import type { APIRoute } from 'astro';
import { ApiError, unwrap } from '../lib/api/client';
import { keepArea } from '../lib/area';

/** POST {lat, lng}: keeps the nearest commune (lib/area.ts) and answers with it. */
export const POST: APIRoute = async ({ request, cookies, url, locals }) => {
  const { lat, lng } = (await request.json().catch(() => ({}))) as { lat?: unknown; lng?: unknown };
  if (typeof lat !== 'number' || typeof lng !== 'number') return new Response(null, { status: 400 });
  try {
    const loc = await unwrap(locals.api.GET('/v1/regions/nearest', { params: { query: { lat, lng } } }));
    return Response.json(keepArea(cookies, url, loc));
  } catch (e) {
    return new Response(null, { status: e instanceof ApiError ? e.status : 502 });
  }
};
