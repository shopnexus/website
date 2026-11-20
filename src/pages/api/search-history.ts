import type { APIRoute } from 'astro';
import { unwrap } from '../../lib/api/client';
import { relay } from '../../lib/api/relay';

// The header's "Tìm gần đây" for a signed-in buyer: GET lists, DELETE empties (lib/search-box.ts).
export const GET: APIRoute = ({ locals }) => relay(locals, () => unwrap(locals.api.GET('/v1/search/history')));

export const DELETE: APIRoute = ({ locals }) => relay(locals, () => unwrap(locals.api.DELETE('/v1/search/history')));
