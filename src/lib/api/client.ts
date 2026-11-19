import { API_URL } from 'astro:env/server';
import createClient from 'openapi-fetch';
import type { components, paths } from './schema';

// The Go server's client, typed from its OpenAPI (schema.d.ts, `bun run api`).
// It runs only on this server: pages and endpoints call it while they render.

export type Schemas = components['schemas'];

/** A server error, from its `{error: {code, …}}` body. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly details: Schemas['Error']['error']['details'] = {},
    readonly fields: Record<string, string> = {},
  ) {
    super(`${status} ${code}`);
  }
}

export interface Caller {
  /** The access token; none for a guest. */
  token?: string;
  /** The browser's address chain, so the server's per-address limits see the buyer, not this server. */
  forwardedFor?: string;
}

export type Api = ReturnType<typeof apiClient>;

export function apiClient({ token, forwardedFor }: Caller = {}) {
  const client = createClient<paths>({ baseUrl: API_URL });
  client.use({
    onRequest({ request }) {
      if (token) request.headers.set('authorization', `Bearer ${token}`);
      if (forwardedFor) request.headers.set('x-forwarded-for', forwardedFor);
      return request;
    },
  });
  return client;
}

type Result<T> = { data?: T; error?: unknown; response: Response };

/** The data of a call, or an ApiError. */
export async function unwrap<T>(call: Promise<Result<T>>): Promise<T> {
  const { data, error, response } = await call;
  if (!response.ok) {
    const e = (error as Partial<Schemas['Error']> | undefined)?.error;
    throw new ApiError(response.status, e?.code ?? 'unknown', e?.details, e?.fields);
  }
  return data as T;
}

/** The data of a call, or null when the server answers one of `missing` (not there, or a bad id or cursor). */
export async function orNull<T>(call: Promise<Result<T>>, missing = [400, 404]): Promise<T | null> {
  return unwrap(call).catch((e) => {
    if (e instanceof ApiError && missing.includes(e.status)) return null;
    throw e;
  });
}

/** The page after `after`, or the first page when there is no cursor or the server refuses it. */
export async function pageOrFirst<T>(after: string | undefined, page: (cursor?: string) => Promise<Result<T>>): Promise<T> {
  return (after ? await orNull(page(after)) : null) ?? unwrap(page());
}

export { idempotencyKey } from '../key';
