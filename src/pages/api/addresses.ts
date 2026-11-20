import type { APIRoute } from 'astro';
import { addressRefusal, postedDraft, saveAddress } from '../../lib/addresses';

/** POST: the address form from a dialog; 201 with the new address, or 422 with what the form shows. */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session.token) return new Response(null, { status: 401 });
  const form = await request.formData();
  try {
    const saved = await saveAddress(locals.api, { ...postedDraft(form), id: undefined }, String(form.get('key') ?? ''));
    return Response.json(saved, { status: 201 });
  } catch (e) {
    return Response.json(addressRefusal(e), { status: 422 });
  }
};
