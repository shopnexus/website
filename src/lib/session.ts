import type { AstroGlobal } from 'astro';
import { ME } from '../data/common';
import { R } from './routes';

// The mock session: a cookie that "Đăng nhập" sets and "Đăng xuất" clears.
// Signed in, every page shows ME. It stands in for the server's sign-in until
// the website is wired to it.

export const SESSION_COOKIE = 'sn_session';

export type Viewer = typeof ME;

type Ctx = Pick<AstroGlobal, 'cookies'>;

export const viewer = (ctx: Ctx): Viewer | null => (ctx.cookies.has(SESSION_COOKIE) ? ME : null);

/** For pages behind sign-in: the viewer, or a redirect to Đăng nhập that comes back here. */
export function requireViewer(ctx: Pick<AstroGlobal, 'cookies' | 'url' | 'redirect'>): Viewer | Response {
  const v = viewer(ctx);
  if (v) return v;
  return ctx.redirect(`${R.login}?tiep=${encodeURIComponent(ctx.url.pathname + ctx.url.search)}`);
}
