// The feed's tab keys, in Seg order, and its page size. Split from feed.ts so
// the browser script imports them without the mock data.
export const FEED_TABS = ['cho-ban', 'gan-ban', 'moi-nhat'] as const;
export type FeedTab = (typeof FEED_TABS)[number];
export const FEED_PAGE = 10;
