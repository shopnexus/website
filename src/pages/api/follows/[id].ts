import type { APIRoute } from 'astro';
import { unwrap } from '../../../lib/api/client';
import { relay } from '../../../lib/api/relay';

// "Theo dõi" on Người bán: PUT follows the account, DELETE stops.
export const PUT: APIRoute = ({ params, locals }) =>
  relay(locals, () => unwrap(locals.api.POST('/v1/follows', { body: { account_id: params.id ?? '' } })));

export const DELETE: APIRoute = ({ params, locals }) =>
  relay(locals, () => unwrap(locals.api.DELETE('/v1/follows/{account_id}', { params: { path: { account_id: params.id ?? '' } } })));
