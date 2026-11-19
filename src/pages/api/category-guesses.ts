import type { APIRoute } from 'astro';
import { unwrap } from '../../lib/api/client';
import { relay } from '../../lib/api/relay';

/** POST {title, description}: the subcategory the text reads as, or null. */
export const POST: APIRoute = async ({ request, locals }) => {
  const { title, description } = (await request.json().catch(() => ({}))) as { title?: string; description?: string };
  if (!title?.trim()) return new Response(null, { status: 400 });
  const body = { title: title.trim().slice(0, 70), description: description?.slice(0, 1500) };
  return relay(locals, () => unwrap(locals.api.POST('/v1/category-guesses', { body })));
};
