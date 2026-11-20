import type { APIRoute } from 'astro';
import { unwrap } from '../../../lib/api/client';
import { relay } from '../../../lib/api/relay';

// A listing page fetched ahead of the tap counted no view; PUT counts the open (ViewedMark).
export const PUT: APIRoute = ({ params, locals }) =>
  relay(locals, () => unwrap(locals.api.PUT('/v1/viewed/{listing_id}', { params: { path: { listing_id: params.id ?? '' } } })));
