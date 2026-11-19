import { ApiError } from './client';

// The small endpoints the page scripts call (/luu, /theo-doi): a guest gets
// 401, which the script turns into Đăng nhập; otherwise the server's status.

export async function relay(locals: App.Locals, call: () => Promise<unknown>) {
  if (!locals.session.token) return new Response(null, { status: 401 });
  try {
    await call();
    return new Response(null, { status: 204 });
  } catch (e) {
    return new Response(null, { status: e instanceof ApiError ? e.status : 502 });
  }
}
