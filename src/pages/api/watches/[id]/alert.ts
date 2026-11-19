import type { APIRoute } from 'astro';
import { unwrap } from '../../../../lib/api/client';
import { relay } from '../../../../lib/api/relay';

// A saved search's bell in Đã lưu: PUT tells again, DELETE mutes.
const path = (id = '') => ({ params: { path: { id } } });

export const PUT: APIRoute = ({ params, locals }) => relay(locals, () => unwrap(locals.api.POST('/v1/search/watches/{id}/unmute', path(params.id))));

export const DELETE: APIRoute = ({ params, locals }) =>
  relay(locals, () => unwrap(locals.api.POST('/v1/search/watches/{id}/mute', path(params.id))));
