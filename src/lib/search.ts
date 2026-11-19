import type { AstroCookies } from 'astro';
import type { Schemas } from './api/client';
import { near } from './area';
import type { Condition } from './listing';
import { R } from './routes';

// A search as Tìm kiếm's URL holds it, in Vietnamese keys, and as the server
// takes it. ?q= the words, muc= a category code, gia-tu=/gia-den= the price,
// tinh-trang= (moi, nhu-moi, da-dung, repeatable), tra-gia=1, sap-xep=, bo=
// a chip to leave out (repeatable), gan= km around the buyer, theo-doi= a
// saved search, anh= a photo's upload, sau= the next page's cursor.

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

const CONDITION_KEYS: Record<string, Condition> = { moi: 'new', 'nhu-moi': 'like_new', 'da-dung': 'used' };
const SORT_KEYS: Record<string, Sort> = { 'phu-hop': 'relevance', moi: 'newest', 'gia-thap': 'price_asc', 'gia-cao': 'price_desc', gan: 'nearest' };
export const NEAR_STEPS = [2, 5, 10, 20] as const;

const keyOf = <T>(map: Record<string, T>, v: T) => Object.entries(map).find(([, x]) => x === v)?.[0];
const num = (s: string | null) => (s && /^\d+$/.test(s.replace(/\D/g, '')) ? Number(s.replace(/\D/g, '')) : undefined);

/** A sort's key in the URL: newest → moi. */
export const sortKey = (s?: Sort) => (s ? keyOf(SORT_KEYS, s) : undefined);

export function readSearch(url: URL): Search {
  const p = url.searchParams;
  const km = Number(p.get('gan'));
  return {
    q: (p.get('q') ?? '').trim().slice(0, 200),
    category: p.get('muc') || undefined,
    min: num(p.get('gia-tu')),
    max: num(p.get('gia-den')),
    conditions: p.getAll('tinh-trang').flatMap((c) => CONDITION_KEYS[c] ?? []),
    offers: p.get('tra-gia') === '1',
    sort: SORT_KEYS[p.get('sap-xep') ?? ''],
    off: p.getAll('bo'),
    km: (NEAR_STEPS as readonly number[]).includes(km) ? km : undefined,
    watch: p.get('theo-doi') || undefined,
    photo: p.get('anh') || undefined,
    after: p.get('sau') || undefined,
  };
}

/** The search's URL on `base` (Tìm kiếm by default), with `change` applied; the cursor always goes. */
export function searchHref(s: Search, change: Partial<Search> = {}, base: string = R.search) {
  const v = { ...s, after: undefined, ...change };
  const p = new URLSearchParams();
  if (v.q) p.set('q', v.q);
  if (v.category) p.set('muc', v.category);
  if (v.min !== undefined) p.set('gia-tu', String(v.min));
  if (v.max !== undefined) p.set('gia-den', String(v.max));
  for (const c of v.conditions) p.append('tinh-trang', keyOf(CONDITION_KEYS, c)!);
  if (v.offers) p.set('tra-gia', '1');
  if (v.sort) p.set('sap-xep', sortKey(v.sort)!);
  for (const o of v.off) p.append('bo', o);
  if (v.km) p.set('gan', String(v.km));
  if (v.watch) p.set('theo-doi', v.watch);
  if (v.photo) p.set('anh', v.photo);
  if (v.after) p.set('sau', v.after);
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

export const PAGE = 24;

/** The query for GET /v1/search. A saved search takes only its id, the sort, the chips left out and the cursor. */
export function serverQuery(s: Search, cookies: AstroCookies) {
  const place = near(cookies);
  const common = { sort: s.sort, off: s.off.length ? s.off : undefined, cursor: s.after, limit: PAGE, ...place };
  // A saved search takes no place, so it cannot sort by distance.
  if (s.watch) return { watch: s.watch, sort: s.sort === 'nearest' ? undefined : s.sort, off: common.off, cursor: s.after, limit: PAGE };
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
