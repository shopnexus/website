import { API_URL } from 'astro:env/server';

/** Calls the Go server from a page or endpoint while it renders. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { accept: 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
