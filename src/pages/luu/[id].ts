import type { APIRoute } from 'astro';
import { unwrap } from '../../lib/api/client';
import { relay } from '../../lib/api/relay';

// The heart on a listing: PUT saves, DELETE forgets (page-motion.ts).
const path = (id = '') => ({ params: { path: { listing_id: id } } });

export const PUT: APIRoute = ({ params, locals }) => relay(locals, () => unwrap(locals.api.PUT('/v1/saved/{listing_id}', path(params.id))));

export const DELETE: APIRoute = ({ params, locals }) =>
  relay(locals, () => unwrap(locals.api.DELETE('/v1/saved/{listing_id}', path(params.id))));
