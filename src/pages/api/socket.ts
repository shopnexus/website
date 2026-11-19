import type { APIRoute } from 'astro';
import { PUBLIC_API_URL } from 'astro:env/server';
import { refreshAccess } from '../../lib/session';

// GET: the socket's URL and the access token Tin nhắn opens it with
// (lib/socket.ts), renewed when under 90 s remain. Only this endpoint hands
// the token to the browser, and only to this site's own pages. The server has
// no short-lived socket ticket, so it is the access token itself.

/** When a JWT expires, from its exp claim; 0 when it cannot be read. */
function expiry(token: string) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(part)) as { exp?: number };
    return (claims.exp ?? 0) * 1000;
  } catch {
    return 0;
  }
}

/** ws(s)://api.<host>/v1/ws, or PUBLIC_API_URL's host. */
function socketUrl(url: URL, proto: string | null) {
  const base = PUBLIC_API_URL ? new URL(PUBLIC_API_URL) : new URL(`${proto ?? url.protocol.slice(0, -1)}://api.${url.host.replace(/^www\./, '')}`);
  base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
  base.pathname = '/v1/ws';
  return base.toString();
}

const NO_STORE = { 'cache-control': 'no-store' };

/** A fetch from this site's own page: Sec-Fetch-Site, else an Origin equal to the site's. */
function sameOrigin(req: Request, url: URL, proto: string | null) {
  const site = req.headers.get('sec-fetch-site');
  if (site) return site === 'same-origin';
  return req.headers.get('origin') === `${proto ?? url.protocol.slice(0, -1)}://${url.host}`;
}

export const GET: APIRoute = async (ctx) => {
  const proto = ctx.request.headers.get('x-forwarded-proto')?.split(',')[0].trim() ?? null;
  // Checked before anything else, so a refresh runs only for the site's own page.
  if (!sameOrigin(ctx.request, ctx.url, proto)) return new Response(null, { status: 403, headers: NO_STORE });
  let token = ctx.locals.session.token;
  if (!token) return new Response(null, { status: 401, headers: NO_STORE });
  let exp = expiry(token);
  if (exp - Date.now() < 90_000) {
    const t = await refreshAccess(ctx);
    if (!t) return new Response(null, { status: 401, headers: NO_STORE });
    token = t.access_token;
    exp = Date.parse(t.access_token_expires_at);
  }
  return Response.json({ url: socketUrl(ctx.url, proto), token, expiresAt: new Date(exp).toISOString() }, { headers: NO_STORE });
};
