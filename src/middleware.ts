import { defineMiddleware } from 'astro:middleware';
import { apiClient, prefetchRequest } from './lib/api/client';
import { openPage, openSession } from './lib/session';

// Every rendered request gets the server's client in locals, signed in with
// the buyer's token when there is one (lib/session.ts).
export const onRequest = defineMiddleware(async (ctx, next) => {
  if (ctx.isPrerendered) {
    ctx.locals.session = {};
    ctx.locals.api = apiClient();
    ctx.locals.viewer = null;
    return next();
  }
  // The address chain as this server got it, plus the hop that reached it.
  const forwardedFor = [ctx.request.headers.get('x-forwarded-for'), ctx.clientAddress].filter(Boolean).join(', ');
  const caller = { forwardedFor, prefetch: prefetchRequest(ctx.request.headers) };
  // Pages, and the form posts they handle, read the viewer before they stream,
  // while a dead access cookie can still be dropped. Images, partials and endpoints do without it.
  const page = ['GET', 'POST'].includes(ctx.request.method) && ctx.request.headers.get('accept')?.includes('text/html');
  if (page) {
    const { session, viewer } = await openPage(ctx.cookies, ctx.url, caller, ctx.request.method === 'GET');
    ctx.locals.session = session;
    ctx.locals.viewer = viewer;
  } else {
    ctx.locals.session = await openSession(ctx.cookies, ctx.url, caller);
    ctx.locals.viewer = null;
  }
  ctx.locals.api = apiClient(ctx.locals.session);
  const res = await next();
  // A page renders for the buyer's cookies, so no shared cache may keep it.
  if (res.headers.get('content-type')?.startsWith('text/html') && !res.headers.has('cache-control')) res.headers.set('cache-control', 'private');
  return res;
});
