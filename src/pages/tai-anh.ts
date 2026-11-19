import type { APIRoute } from 'astro';
import { ApiError, unwrap } from '../lib/api/client';

/** POST {content_type, size}: a presigned PUT for one photo (lib/upload.ts). */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session.token) return new Response(null, { status: 401 });
  const { content_type, size } = (await request.json().catch(() => ({}))) as { content_type?: string; size?: number };
  if (content_type !== 'image/jpeg' && content_type !== 'image/png' && content_type !== 'image/webp') return new Response(null, { status: 415 });
  if (typeof size !== 'number') return new Response(null, { status: 400 });
  try {
    const t = await unwrap(locals.api.POST('/v1/uploads', { body: { content_type, size } }));
    return Response.json({ id: t.upload_id, url: t.url, headers: t.headers });
  } catch (e) {
    return new Response(null, { status: e instanceof ApiError ? e.status : 502 });
  }
};
