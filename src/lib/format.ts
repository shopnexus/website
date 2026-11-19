/** A listing as cards and rows show it. */
export interface Listing {
  id: string;
  photo: string;
  /** In đồng. */
  price: number;
  title: string;
  condition: string;
  /** From the buyer, in km. */
  km: number;
  /** The seller's district or province. */
  area: string;
  rating: number;
  /** How long ago it was posted: "12 phút". */
  posted?: string;
  /** Facts the search asked about, shown as chips in place of `posted`. */
  facts?: string[];
  /** The AI price note: "Rẻ hơn 13%". */
  note?: string;
  /** A focal-point crop of the photo (fx, fy, zoom), for listings shown as crops of one shot. */
  crop?: [number, number, number];
}

const NEAR_KM = 10;

/** 1.250.000 */
export const group = (n: number) => Math.round(n).toLocaleString('de-DE');

/** How long ago, as the app says it: "12 phút", "3 giờ", "5 ngày", "2 tháng". */
export function ago(iso: string, now = Date.now()) {
  const m = Math.max(1, Math.floor((now - Date.parse(iso)) / 60_000));
  if (m < 60) return `${m} phút`;
  if (m < 1440) return `${Math.floor(m / 60)} giờ`;
  if (m < 43_200) return `${Math.floor(m / 1440)} ngày`;
  if (m < 525_600) return `${Math.floor(m / 43_200)} tháng`;
  return `${Math.floor(m / 525_600)} năm`;
}

/** Seconds as a countdown: 0:45. */
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** 1,2 */
export const decimal = (n: number, digits = 1) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: digits });

/** The number and unit of a price, for the two-size price: ["1.250.000", "₫"]; on a card,
 * 10 triệu and above shortens to ["12,5", "tr ₫"]. */
export function priceParts(vnd: number, short = true): [string, string] {
  if (short && vnd >= 10_000_000) return [decimal(vnd / 1_000_000), 'tr ₫'];
  return [group(vnd), '₫'];
}

/** "1.250.000 ₫", or "12,5 tr ₫" from 10 triệu when short. */
export const money = (vnd: number, short = false) => priceParts(vnd, short).join(' ');

/** A card's place, as the app's whereText: the distance under 10 km, the seller's place beyond or without one. */
export const where = (km: number | undefined, area: string) => (km === undefined || km >= NEAR_KM ? area : km < 1 ? 'Dưới 1 km' : `${decimal(km)} km`);

/** An Unsplash photo by id, cropped to w×h. */
export function img(id: string, w = 600, h?: number) {
  return `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ''}&q=80&auto=format&fit=crop`;
}

/** A square crop around a focal point, zoomed: the detail gallery's close-ups. */
export function crop(id: string, size: number, fx = 0.5, fy = 0.5, zoom = 1) {
  return `https://images.unsplash.com/photo-${id}?w=${size}&h=${size}&fit=crop&crop=focalpoint&fp-x=${fx}&fp-y=${fy}&fp-z=${zoom}&q=80&auto=format`;
}

/** A listing's photo at w×h, cropped when the listing says so. */
export const listingPhoto = (it: Pick<Listing, 'photo' | 'crop'>, w: number, h = w) =>
  it.crop ? crop(it.photo, Math.max(w, h), ...it.crop) : img(it.photo, w, h);
