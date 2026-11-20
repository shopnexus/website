import type { APIRoute } from 'astro';
import { unwrap } from '../../../../lib/api/client';
import { relay } from '../../../../lib/api/relay';

// "Hữu ích" on a review: PUT marks it, DELETE takes the mark back (ReviewItem).
const path = (id = '') => ({ params: { path: { id } } });

export const PUT: APIRoute = ({ params, locals }) => relay(locals, () => unwrap(locals.api.PUT('/v1/reviews/{id}/helpful', path(params.id))));

export const DELETE: APIRoute = ({ params, locals }) =>
  relay(locals, () => unwrap(locals.api.DELETE('/v1/reviews/{id}/helpful', path(params.id))));
