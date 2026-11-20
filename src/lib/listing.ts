import type { Schemas } from './api/client';

/** A listing as cards and rows show it: the app's ListingSummary. */
export interface Card {
  id: string;
  /** The end of its address, R.listing(slug). */
  slug: string;
  /** The cover's URL; absent while the photos are processed. */
  photo?: string;
  /** In đồng. */
  price: number;
  title: string;
  condition: string;
  /** Whole km from the buyer; absent without a place. */
  km?: number;
  /** The listing's commune. */
  area: string;
  saved: boolean;
  /** The price before a drop in the last week; absent without one. */
  previousPrice?: number;
}

export type Condition = Schemas['Condition'];

/** Whether a string can be a listing's or an account's id, before asking the server. */
export const isId = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

/** The condition scale, in order, as the app names it. */
export const CONDITIONS: Record<Condition, string> = {
  new: 'Mới',
  like_new: 'Như mới',
  used: 'Đã dùng',
};

/** A condition a newer server adds reads as used, the one that promises least. */
export const conditionLabel = (c: string) => CONDITIONS[c as Condition] ?? CONDITIONS.used;

export const card = (it: Schemas['SearchItem']): Card => ({
  id: it.id,
  slug: it.slug,
  photo: it.cover_thumb_url,
  price: it.price,
  title: it.title,
  condition: conditionLabel(it.condition),
  km: it.distance_km,
  area: it.commune,
  saved: it.saved,
  previousPrice: it.price_drop?.previous_price,
});
