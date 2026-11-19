import { loginHref } from './routes';

// In the browser: a button the page flips at once (save, follow), then asks
// the server through `path` with PUT for on and DELETE for off. A guest goes
// to Đăng nhập; false means the call failed and the button should go back.
export async function toggleRemote(path: string, on: boolean): Promise<boolean> {
  const res = await fetch(path, { method: on ? 'PUT' : 'DELETE' }).catch(() => null);
  if (res?.status === 401) {
    location.href = loginHref(location.pathname + location.search);
    return true;
  }
  return !!res?.ok;
}
