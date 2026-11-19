import { ApiError } from './client';

// The small endpoints the page scripts call (/api/saved, /api/follows,
// /api/uploads, /api/area, /api/watches/<id>/alert): a guest gets 401, which
// the script turns into Đăng nhập, unless the endpoint is for guests too. The
// answer is the call's data as JSON, 204 without data, or the server's error status.

export async function relay(locals: App.Locals, call: () => Promise<unknown>, { guests = false } = {}) {
  if (!guests && !locals.session.token) return new Response(null, { status: 401 });
  try {
    const data = await call();
    return data === undefined ? new Response(null, { status: 204 }) : Response.json(data);
  } catch (e) {
    return new Response(null, { status: e instanceof ApiError ? e.status : 502 });
  }
}
