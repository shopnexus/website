// Home's feed from the mock data, a page at a time, until the server's feed
// endpoint is wired. /bang-tin renders a page as cards for the tabs and
// "Xem thêm tin".
import { EXTRA_RESULTS, FOR_YOU, LISTINGS, RESULTS, SEARCH_RESULTS } from '../data/listings';
import { FEED_PAGE, FEED_TABS, type FeedTab } from './feed-tabs';
import type { Listing } from './format';

// Every listing once, in the "Dành cho bạn" order.
const POOL: Listing[] = [...FOR_YOU, ...LISTINGS, ...RESULTS, ...SEARCH_RESULTS, ...EXTRA_RESULTS].filter(
  (it, i, all) => all.findIndex((x) => x.id === it.id) === i,
);

/** "12 phút", "3 giờ", "1 ngày" in minutes; a listing without one goes last. */
function age(posted?: string) {
  const m = posted?.match(/(\d+)\s*(phút|giờ|ngày)/);
  if (!m) return Number.POSITIVE_INFINITY;
  return +m[1] * { phút: 1, giờ: 60, ngày: 1440 }[m[2] as 'phút' | 'giờ' | 'ngày'];
}

const ORDER: Record<FeedTab, Listing[]> = {
  'cho-ban': POOL,
  'gan-ban': [...POOL].sort((a, b) => a.km - b.km),
  'moi-nhat': [...POOL].sort((a, b) => age(a.posted) - age(b.posted)),
};

export function feedTab(raw: string | null): FeedTab {
  return FEED_TABS.includes(raw as FeedTab) ? (raw as FeedTab) : 'cho-ban';
}

/** Page `page` (from 1) of a tab, and whether another page follows. */
export function feedPage(tab: FeedTab, page: number) {
  const all = ORDER[tab];
  const from = (Math.max(1, page) - 1) * FEED_PAGE;
  return { items: all.slice(from, from + FEED_PAGE), more: from + FEED_PAGE < all.length };
}
