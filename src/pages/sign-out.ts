import type { APIRoute } from 'astro';
import { R } from '../lib/routes';
import { dropTokens } from '../lib/session';

/** "Đăng xuất": ends the session on the server, forgets the tokens and goes Home. */
export const POST: APIRoute = async ({ cookies, locals, redirect }) => {
  if (locals.session.token) {
    // Signed out on the server already, or out of reach: the cookies go either way.
    // The browser's push token first, while the session still names it.
    await locals.api.DELETE('/v1/me/push-token').catch(() => {});
    await locals.api.DELETE('/v1/auth/sessions/current').catch(() => {});
  }
  dropTokens(cookies);
  return redirect(R.home, 303);
};
