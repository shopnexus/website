import icons from 'virtual:icons';
import type { Schemas } from './api/client';
import { R } from './routes';

// A message's text as HTML: plain text, its line breaks kept, and each
// ShopNexus link the server read (refs) as a chip with the thing's name.

export type Ref = Schemas['MessageRef'];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Where a ref leads on the website. */
export function refHref(r: Ref): string {
  if (r.listing) return R.listing(r.listing.slug);
  if (r.seller) return R.seller(r.seller.id);
  if (r.order) return R.order(r.order.id);
  if (r.category) return R.category(r.category.code);
  if (r.search) return `${R.search}?${new URLSearchParams({ q: r.search.query })}`;
  return r.url;
}

const ICON: Record<Ref['kind'], string> = {
  listing: 'sell-outline-rounded',
  seller: 'person-outline-rounded',
  order: 'receipt-long-outline-rounded',
  category: 'category-outline-rounded',
  search: 'search-rounded',
};

/** The chip's words: the listing's title, the person's name, the order's code. */
export function refLabel(r: Ref): string {
  if (r.listing) return r.listing.title;
  if (r.seller) return r.seller.name;
  if (r.order) return `Đơn ${r.order.code}`;
  if (r.category) return r.category.name;
  if (r.search) return `“${r.search.query}”`;
  return r.url;
}

/** A ref drawn as a card under the text: listings and orders, which have a photo and a price. */
export const carded = (r: Ref) => !!(r.listing || r.order);

function chip(r: Ref, label?: string) {
  const i = icons[ICON[r.kind]];
  const svg = i ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${i.width} ${i.height}" width="15" height="15" aria-hidden="true">${i.body}</svg>` : '';
  return `<a href="${esc(refHref(r))}" class="msg-ref" data-ref="${r.kind}">${svg}<span>${esc(label ?? refLabel(r))}</span></a>`;
}

const HOLD = /(\d+)/g;

/**
 * The text as HTML. A link that is a card (a listing, an order) and stands
 * alone in the text is dropped, since the card under the text shows it.
 */
export function renderText(text: string, refs: Ref[] = []): string {
  let src = text;
  refs.forEach((r, i) => (src = src.split(r.url).join(`\uE000${i}\uE001`)));
  const lone = src.trim().match(/^\uE000(\d+)\uE001$/);
  if (lone && carded(refs[Number(lone[1])])) return '';
  return esc(src).replace(HOLD, (_, i) => chip(refs[Number(i)]));
}
