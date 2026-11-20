import type { AstroCookies, AstroGlobal } from 'astro';
import { type Api, ApiError, type Caller, type Schemas, apiClient, unwrap } from './api/client';
import { PUSH_COOKIE } from './push';
import { loginHref } from './routes';

// The buyer's session with the server. The access and refresh tokens live in
// httpOnly cookies the browser never reads; the middleware refreshes the
// access token when its cookie has expired and gives each request its client.

const ACCESS = 'sn_at';
const REFRESH = 'sn_rt';
/** The server forgets a session left unused for 30 days. */
const REFRESH_DAYS = 30;

type Tokens = Pick<Schemas['Tokens'], 'access_token' | 'access_token_expires_at' | 'refresh_token'>;

/** The site's cookie policy: httpOnly, Lax, Secure over https. */
export function cookie(url: URL, maxAge: number, path = '/') {
  return { path, httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', maxAge } as const;
}

/** Whole seconds from now until `iso`, less `margin`, at least 1: a cookie's maxAge. */
export const secondsUntil = (iso: string, margin = 0) => Math.max(1, Math.floor((Date.parse(iso) - Date.now()) / 1000) - margin);

/** Keeps a sign-in's or a refresh's tokens. The access cookie ends 30 s before the token does. */
export function keepTokens(cookies: AstroCookies, url: URL, t: Tokens) {
  keepAccess(cookies, url, t);
  cookies.set(REFRESH, t.refresh_token, cookie(url, REFRESH_DAYS * 86400));
}

/** Keeps a new access token alone, as reauthentication gives; the refresh token stays. */
export function keepAccess(cookies: AstroCookies, url: URL, t: Pick<Tokens, 'access_token' | 'access_token_expires_at'>) {
  cookies.set(ACCESS, t.access_token, cookie(url, secondsUntil(t.access_token_expires_at, 30)));
}

/** A reauthenticated access token, kept and used for the rest of this request. */
export function renewAccess(ctx: Pick<AstroGlobal, 'cookies' | 'url' | 'locals'>, t: Pick<Tokens, 'access_token' | 'access_token_expires_at'>) {
  keepAccess(ctx.cookies, ctx.url, t);
  ctx.locals.session = { ...ctx.locals.session, token: t.access_token };
  ctx.locals.api = apiClient(ctx.locals.session);
}

const dropAccess = (cookies: AstroCookies) => cookies.delete(ACCESS, { path: '/' });

export function dropTokens(cookies: AstroCookies) {
  dropAccess(cookies);
  cookies.delete(REFRESH, { path: '/' });
  // The next session gives the browser's push token again.
  cookies.delete(PUSH_COOKIE, { path: '/' });
}

// A refresh token works once, and two refreshes with one token sign the
// session out. So one refresh runs per token, and new tokens stay for 30 s
// for the requests that still carry the old cookie. A failure is forgotten
// at once. null: the server was out of reach.
const refreshing = new Map<string, Promise<Tokens | ApiError | null>>();

function refresh(token: string, forwardedFor: string) {
  let run = refreshing.get(token);
  if (!run) {
    run = unwrap(apiClient({ forwardedFor }).POST('/v1/auth/refresh', { body: { refresh_token: token } })).catch((e) =>
      e instanceof ApiError ? e : null,
    );
    refreshing.set(token, run);
    run.then((t) => (t && !(t instanceof ApiError) ? setTimeout(() => refreshing.delete(token), 30_000) : refreshing.delete(token)));
  }
  return run;
}

export interface Session extends Caller {
  /** Why the session ended on this request: session_revoked, account_suspended and the like. */
  ended?: string;
}

/** The middleware's step: a live access token for this request, refreshed when needed. */
export async function openSession(cookies: AstroCookies, url: URL, forwardedFor: string): Promise<Session> {
  const token = cookies.get(ACCESS)?.value;
  const refreshToken = cookies.get(REFRESH)?.value;
  if (token || !refreshToken) return { token, forwardedFor };
  const t = await refresh(refreshToken, forwardedFor);
  if (t instanceof ApiError) {
    // 401 and 403 end the session (revoked, expired, suspended). Any other
    // answer is the server's trouble: a guest for this request, the cookies kept.
    if (t.status === 401 || t.status === 403) {
      dropTokens(cookies);
      return { forwardedFor, ended: t.code };
    }
  } else if (t) {
    keepTokens(cookies, url, t);
    return { token: t.access_token, forwardedFor };
  }
  return { forwardedFor };
}

/**
 * Seconds since the session last proved its owner, from the access token's auth_time;
 * Infinity when unknown. The server still decides: this only picks the next step.
 */
export function authAge(token?: string) {
  try {
    const { auth_time } = JSON.parse(Buffer.from(token!.split('.')[1], 'base64url').toString()) as { auth_time?: number };
    return typeof auth_time === 'number' ? Date.now() / 1000 - auth_time : Infinity;
  } catch {
    return Infinity;
  }
}

/**
 * A fresh access token before the current one runs out, for a caller that
 * hands it on (the socket); null when the session has ended.
 */
export async function refreshAccess(ctx: Pick<AstroGlobal, 'cookies' | 'url' | 'locals'>): Promise<Tokens | null> {
  const refreshToken = ctx.cookies.get(REFRESH)?.value;
  if (!refreshToken) return null;
  const t = await refresh(refreshToken, ctx.locals.session.forwardedFor ?? '');
  if (t instanceof ApiError) {
    if (t.status === 401 || t.status === 403) dropTokens(ctx.cookies);
    return null;
  }
  if (!t) return null;
  keepTokens(ctx.cookies, ctx.url, t);
  ctx.locals.session = { ...ctx.locals.session, token: t.access_token };
  ctx.locals.api = apiClient(ctx.locals.session);
  return t;
}

/** The signed-in buyer as the header and the account pages show them. */
export interface Viewer {
  id: string;
  /** "Tài khoản của bạn" until the profile has a name. */
  name: string;
  /** Whether the profile has a name of its own. */
  named: boolean;
  /** How the account signs in: its phone and email. */
  identities: Schemas['Identity'][];
  /** The avatar's URL, absent without one. */
  photo?: string;
  /** Unread messages and notices, for the header's badges. */
  unread: { messages: number; notifications: number };
}

/** The signed-in buyer, or null. The middleware reads it before the page renders. */
export const viewer = (ctx: Pick<AstroGlobal, 'locals'>): Viewer | null => ctx.locals.viewer;

/** The middleware's second step, while cookies can still change. */
/** `counts` false skips the badges' call: a form post redirects before anything shows them. */
export async function loadViewer(api: Api, session: Session, cookies: AstroCookies, counts = true): Promise<Viewer | null> {
  if (!session.token) return null;
  try {
    // The badges are extra: a failure there leaves them at 0.
    const none = { unread: 0, notifications: 0 };
    const [me, unread] = await Promise.all([
      unwrap(api.GET('/v1/accounts/me')),
      counts ? unwrap(api.GET('/v1/me/unread')).catch(() => none) : none,
    ]);
    return {
      id: me.id,
      name: me.display_name || 'Tài khoản của bạn',
      named: !!me.display_name,
      photo: me.avatar_url,
      identities: me.identities,
      unread: { messages: unread.unread, notifications: unread.notifications },
    };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      // The access token no longer works; the refresh token decides on the next request.
      dropAccess(cookies);
    }
    // Out of reach or failing: a guest for this request.
    return null;
  }
}

/** For pages behind sign-in: the viewer, or a redirect to Đăng nhập that comes back here. */
export function requireViewer(ctx: Pick<AstroGlobal, 'locals' | 'url' | 'redirect'>): Viewer | Response {
  const v = viewer(ctx);
  if (v) return v;
  return ctx.redirect(loginUrl(ctx.url, ctx.locals.session.ended));
}

/** Đăng nhập, coming back to `url`, with `&ended=` when another device signed this one out or the account is suspended. */
export const loginUrl = (url: URL, ended?: string) => loginHref(url.pathname + url.search, ended === 'session_revoked' || ended === 'account_suspended' ? ended : undefined);
