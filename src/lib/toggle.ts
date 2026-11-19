import { loginHref } from './routes';

// In the browser: a button the page flips at once (save, follow), then asks
// the server through `path` with PUT for on and DELETE for off. A guest goes
// to Đăng nhập; false means the call failed and the button should go back.
// Calls on one path go in order, so quick taps land as the last one left it.
const queue = new Map<string, Promise<unknown>>();

export function toggleRemote(path: string, on: boolean): Promise<boolean> {
  const call = (queue.get(path) ?? Promise.resolve()).then(() => send(path, on));
  queue.set(path, call);
  call.finally(() => queue.get(path) === call && queue.delete(path));
  return call;
}

async function send(path: string, on: boolean) {
  const res = await fetch(path, { method: on ? 'PUT' : 'DELETE' }).catch(() => null);
  if (res?.status === 401) {
    location.href = loginHref(location.pathname + location.search);
    return true;
  }
  return !!res?.ok;
}
