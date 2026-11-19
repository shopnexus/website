// Home's feed, a page at a time. /bang-tin renders a page as cards for the
// tabs and "Xem thêm tin". Dành cho bạn is Home's one page of for_you; Gần
// bạn and Mới nhất page through search with the server's cursor.
import type { AstroGlobal } from 'astro';
import { unwrap } from './api/client';
import { area, near } from './area';
import { FEED_PAGE, FEED_TABS, type FeedTab } from './feed-tabs';
import { type Card, card } from './listing';

type Ctx = Pick<AstroGlobal, 'locals' | 'cookies'>;

export function feedTab(raw: string | null): FeedTab {
  return FEED_TABS.includes(raw as FeedTab) ? (raw as FeedTab) : 'cho-ban';
}

export interface FeedPage {
  items: Card[];
  /** The cursor of the next page; absent on the last. */
  next?: string;
  /** Gần bạn before the buyer's place is known. */
  needsArea?: boolean;
}

/** Home: the categories with counts, the first feed page and what the buyer viewed. */
export async function homeScreen({ locals, cookies }: Ctx) {
  const home = await unwrap(locals.api.GET('/v1/screens/home', { params: { query: near(cookies) } }));
  return {
    categories: home.categories,
    forYou: home.for_you.map(card),
    viewed: home.viewed && { category: home.viewed.category.display_name, items: home.viewed.items.map(card) },
  };
}

export async function feedPage(ctx: Ctx, tab: FeedTab, after?: string): Promise<FeedPage> {
  if (tab === 'cho-ban') return { items: (await homeScreen(ctx)).forYou };
  if (tab === 'gan-ban' && !area(ctx.cookies)) return { items: [], needsArea: true };
  const page = await unwrap(
    ctx.locals.api.GET('/v1/search', {
      params: { query: { sort: tab === 'gan-ban' ? 'nearby' : 'newest', limit: FEED_PAGE, cursor: after, ...near(ctx.cookies) } },
    }),
  );
  return { items: page.items.map(card), next: page.next_cursor };
}
