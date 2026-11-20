import type { Schemas } from './api/client';

const NEAR_KM = 10;

/** 1.250.000 */
export const group = (n: number) => Math.round(n).toLocaleString('de-DE');

/** An amount as typed or grouped, digits only: "4.800.000 ₫" is 4800000; null without digits. */
export function parseMoney(raw: string) {
  const d = raw.replace(/\D/g, '');
  return d ? Number(d.slice(0, 13)) : null;
}

/** How long ago, as the app says it: "vừa xong", "12 phút trước", "3 giờ trước", "5 ngày trước", "2 tháng trước". */
export function ago(iso: string, now = Date.now()) {
  const m = Math.floor((now - Date.parse(iso)) / 60_000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  if (m < 1440) return `${Math.floor(m / 60)} giờ trước`;
  if (m < 43_200) return `${Math.floor(m / 1440)} ngày trước`;
  if (m < 525_600) return `${Math.floor(m / 43_200)} tháng trước`;
  return `${Math.floor(m / 525_600)} năm trước`;
}

/** "Đang hoạt động" under 5 minutes, then "Hoạt động 3 giờ trước". */
export const activeAgo = (iso: string, now = Date.now()) =>
  now - Date.parse(iso) < 300_000 ? 'Đang hoạt động' : `Hoạt động ${ago(iso, now)}`;

/** A seller's rating as a figure and its line: ["4,9", "32 đánh giá"], or a dash without reviews. */
export const ratingText = (r: { average: number | null; count: number }): [string, string] =>
  r.count && r.average !== null ? [decimal(r.average), `${r.count} đánh giá`] : ['–', 'Chưa có đánh giá'];

/** How soon a seller usually answers, from the server's ReplyTime. */
export const REPLY_TIME: Record<Schemas['ReplyTime'], string> = {
  minutes: 'Thường trả lời trong vài phút',
  hour: 'Thường trả lời trong 1 giờ',
  hours: 'Thường trả lời trong vài giờ',
  day: 'Thường trả lời trong 1 ngày',
};

/** Vietnam's time zone, for every date the site shows. */
export const TZ = 'Asia/Ho_Chi_Minh';

const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ });

/** A day as a list heading: Hôm nay, Hôm qua, the weekday within a week, then the date. */
export function dayLabel(iso: string, now = Date.now()) {
  const d = new Date(iso);
  const today = dayKey(new Date(now));
  const days = Math.round((Date.parse(today) - Date.parse(dayKey(d))) / 86_400_000);
  if (days <= 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return d.toLocaleDateString('vi-VN', { timeZone: TZ, weekday: 'long' }).replace(/^./, (c) => c.toUpperCase());
  const [y, m, day] = dayKey(d).split('-');
  return y === today.slice(0, 4) ? `${day}/${m}` : `${day}/${m}/${y}`;
}

/** 14:05, in Vietnam's time. */
export const hm = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ });

/** An inbox row's time: the hour today, the day label before. */
export const when = (iso: string, now = Date.now()) => (dayLabel(iso, now) === 'Hôm nay' ? hm(iso) : dayLabel(iso, now));

/** The wordings of a time that stays true (Ago.astro); lib/ago words them again in the browser. */
export const TIME_TEXT = { ago, active: activeAgo, when, day: dayLabel } satisfies Record<string, (iso: string, now?: number) => string>;
export type TimeKind = keyof typeof TIME_TEXT;

/** Seconds as a countdown: 0:45. */
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** 1,2 */
export const decimal = (n: number, digits = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: digits });

/** The number and unit of a price, for the two-size price: ["1.250.000", "₫"]; on a card,
 * 10 triệu and above shortens to ["12,5", "tr ₫"]. */
export function priceParts(vnd: number, short = true): [string, string] {
  if (short && vnd >= 10_000_000) return [decimal(vnd / 1_000_000), 'tr ₫'];
  return [group(vnd), '₫'];
}

/** A struck-through old price beside a short price, narrow enough for a phone card:
 * "5,45 tr" from 1 triệu, "850.000" below. */
export const struckPrice = (vnd: number) => (vnd >= 1_000_000 ? `${decimal(vnd / 1_000_000, 2)} tr` : group(vnd));

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

/** A day as Vietnam writes it, in Vietnam's time: 02/10/2026. */
export const date = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ });

/** "0912 345 678", "912345678" or "+84 912…" as +84912345678; undefined when it is not a Vietnamese mobile number. */
export function vnMobile(raw: string) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('84') && d.length === 11) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  return /^[35789]\d{8}$/.test(d) ? `+84${d}` : undefined;
}

/** A +84 number as people write it: 0912 345 678, or with the middle hidden: 09•• ••• 678. */
export function phoneText(e164: string, masked = false) {
  const d = e164.replace(/^\+84/, '0');
  if (d.length !== 10) return d;
  return masked ? `${d.slice(0, 2)}•• ••• ${d.slice(7)}` : `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}
