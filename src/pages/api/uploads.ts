import type { APIRoute } from 'astro';
import { unwrap } from '../../lib/api/client';
import { relay } from '../../lib/api/relay';
import { PHOTO_TYPES } from '../../lib/upload';

/** POST {content_type, size}: a presigned PUT for one photo (lib/upload.ts). */
export const POST: APIRoute = async ({ request, locals }) => {
  const { content_type, size } = (await request.json().catch(() => ({}))) as { content_type?: string; size?: number };
  if (!content_type || !PHOTO_TYPES.includes(content_type)) return new Response(null, { status: 415 });
  if (typeof size !== 'number') return new Response(null, { status: 400 });
  const type = content_type as 'image/jpeg' | 'image/png' | 'image/webp';
  return relay(locals, async () => {
    const t = await unwrap(locals.api.POST('/v1/uploads', { body: { content_type: type, size } }));
    return { id: t.upload_id, url: t.url, headers: t.headers };
  });
};
