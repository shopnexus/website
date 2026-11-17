import type { APIRoute } from 'astro';
import { R } from '../lib/routes';
import { SESSION_COOKIE } from '../lib/session';

/** "Đăng xuất": clears the mock session and goes Home. */
export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return redirect(R.home, 303);
};
