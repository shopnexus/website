import type { APIRoute } from 'astro';
import { unwrap } from '../../lib/api/client';
import { relay } from '../../lib/api/relay';
import { PUSH_COOKIE } from '../../lib/push';
import { cookie } from '../../lib/session';

// This browser's push token for the session (lib/push.ts): PUT gives it to the
// server, DELETE takes it back. The cookie, which the page reads, keeps the
// page from giving it again for a day.

export const PUT: APIRoute = async ({ request, locals, cookies, url }) => {
  const { token } = ((await request.json().catch(() => null)) ?? {}) as { token?: unknown };
  const res = await relay(locals, () => unwrap(locals.api.PUT('/v1/me/push-token', { body: { token: String(token ?? '') } })));
  if (res.ok) cookies.set(PUSH_COOKIE, '1', { ...cookie(url, 86400), httpOnly: false });
  return res;
};

export const DELETE: APIRoute = ({ locals, cookies }) => {
  cookies.delete(PUSH_COOKIE, { path: '/' });
  return relay(locals, () => unwrap(locals.api.DELETE('/v1/me/push-token')));
};
