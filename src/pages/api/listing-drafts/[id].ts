import type { APIRoute } from 'astro';
import { unwrap } from '../../../lib/api/client';
import { relay } from '../../../lib/api/relay';
import { isId } from '../../../lib/listing';
import { draftInput, readSellForm } from '../../../lib/sell';

/** PUT the Đăng tin form (form data): keeps it as the draft <id>. */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const id = params.id ?? '';
  if (!isId(id)) return new Response(null, { status: 400 });
  const form = await request.formData().catch(() => null);
  if (!form) return new Response(null, { status: 400 });
  const body = draftInput(readSellForm(form));
  return relay(locals, async () => {
    await unwrap(locals.api.PUT('/v1/listing-drafts/{id}', { params: { path: { id } }, body }));
  });
};
