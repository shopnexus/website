import type { AstroCookies } from 'astro';
import type { Schemas } from './api/client';
import { near } from './area';
import type { Condition } from './listing';
import { R } from './routes';

// A search as Tìm kiếm's URL holds it, and as the server takes it. ?q= the
// words, category= a category code, min=/max= the price, condition= (new,
// like-new, used; repeatable), offers=1, sort=, off= a chip to leave out
// (repeatable), km= around the buyer, watch= a saved search, photo= a
// photo's upload, after= the next page's cursor.

export type Sort = 'relevance' | 'newest' | 'nearest' | 'price_asc' | 'price_desc';

export interface Search {
  q: string;
  category?: string;
  min?: number;
  max?: number;
  conditions: Condition[];
  offers: boolean;
  sort?: Sort;
  off: string[];
  km?: number;
  watch?: string;
  photo?: string;
  after?: string;
}

const CONDITION_KEYS: Record<string, Condition> = { new: 'new', 'like-new': 'like_new', used: 'used' };
const SORT_KEYS: Record<string, Sort> = { relevance: 'relevance', newest: 'newest', 'price-asc': 'price_asc', 'price-desc': 'price_desc', nearest: 'nearest' };
export const NEAR_STEPS = [2, 5, 10, 20] as const;

const keyOf = <T>(map: Record<string, T>, v: T) => Object.entries(map).find(([, x]) => x === v)?.[0];
const num = (s: string | null) => {
  const digits = s?.replace(/\D/g, '');
  return digits ? Number(digits) : undefined;
};

/** A sort's key in the URL: price_asc → price-asc. */
export const sortKey = (s?: Sort) => (s ? keyOf(SORT_KEYS, s) : undefined);

export function readSearch(url: URL): Search {
  const p = url.searchParams;
  const km = Number(p.get('km'));
  return {
    q: (p.get('q') ?? '').trim().slice(0, 200),
    category: p.get('category') || undefined,
    min: num(p.get('min')),
    max: num(p.get('max')),
    conditions: p.getAll('condition').flatMap((c) => CONDITION_KEYS[c] ?? []),
    offers: p.get('offers') === '1',
    sort: SORT_KEYS[p.get('sort') ?? ''],
    off: p.getAll('off'),
    km: (NEAR_STEPS as readonly number[]).includes(km) ? km : undefined,
    watch: p.get('watch') || undefined,
    photo: p.get('photo') || undefined,
    after: p.get('after') || undefined,
  };
}

/** The search's URL on `base` (Tìm kiếm by default), with `change` applied; the cursor always goes. */
export function searchHref(s: Search, change: Partial<Search> = {}, base: string = R.search) {
  const v = { ...s, after: undefined, ...change };
  const p = new URLSearchParams();
  if (v.q) p.set('q', v.q);
  if (v.category) p.set('category', v.category);
  if (v.min !== undefined) p.set('min', String(v.min));
  if (v.max !== undefined) p.set('max', String(v.max));
  for (const c of v.conditions) p.append('condition', keyOf(CONDITION_KEYS, c)!);
  if (v.offers) p.set('offers', '1');
  if (v.sort) p.set('sort', sortKey(v.sort)!);
  for (const o of v.off) p.append('off', o);
  if (v.km) p.set('km', String(v.km));
  if (v.watch) p.set('watch', v.watch);
  if (v.photo) p.set('photo', v.photo);
  if (v.after) p.set('after', v.after);
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

const PAGE = 24;

/** The query for GET /v1/search. A saved search takes only its id, the sort, the chips left out and the cursor. */
export function serverQuery(s: Search, cookies: AstroCookies) {
  const place = near(cookies);
  const common = { sort: s.sort, off: s.off.length ? s.off : undefined, cursor: s.after, limit: PAGE, ...place };
  // A saved search takes no place, so it cannot sort by distance.
  if (s.watch) return { watch: s.watch, sort: s.sort === 'nearest' ? undefined : s.sort, off: common.off, cursor: common.cursor, limit: PAGE };
  return {
    ...common,
    q: s.photo ? undefined : s.q || undefined,
    photo: s.photo,
    category: s.category,
    price_min: s.min,
    price_max: s.max,
    condition: s.conditions.length ? s.conditions : undefined,
    offers_only: s.offers || undefined,
    radius_km: s.km && place.near_commune ? s.km : undefined,
    // "Gần nhất" needs a place; without one the server's own order stands.
    ...(s.sort === 'nearest' && !place.near_commune ? { sort: undefined } : {}),
  };
}

/** The body for POST /v1/search/watches: "Báo khi có tin mới". */
export function watchInput(s: Search, cookies: AstroCookies): Schemas['SearchWatchInput'] {
  const place = near(cookies);
  return {
    q: s.q,
    category: s.category,
    price_min: s.min,
    price_max: s.max,
    condition: s.conditions.length ? s.conditions : undefined,
    offers_only: s.offers || undefined,
    ...(s.km && place.near_commune ? { near_commune: place.near_commune, radius_km: s.km } : {}),
  };
}
