import { defineMiddleware } from 'astro:middleware';
import { apiClient, prefetchRequest } from './lib/api/client';
import { loadViewer, openSession } from './lib/session';

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
  ctx.locals.session = await openSession(ctx.cookies, ctx.url, { forwardedFor, prefetch: prefetchRequest(ctx.request.headers) });
  ctx.locals.api = apiClient(ctx.locals.session);
  // Pages, and the form posts they handle, read the viewer before they stream,
  // while a dead access cookie can still be dropped. Images, partials and endpoints do without it.
  const page = ['GET', 'POST'].includes(ctx.request.method) && ctx.request.headers.get('accept')?.includes('text/html');
  ctx.locals.viewer = page ? await loadViewer(ctx.locals.api, ctx.locals.session, ctx.cookies, ctx.request.method === 'GET') : null;
  const res = await next();
  // A page renders for the buyer's cookies, so no shared cache may keep it.
  if (res.headers.get('content-type')?.startsWith('text/html') && !res.headers.has('cache-control')) res.headers.set('cache-control', 'private');
  return res;
});
