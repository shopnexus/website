// The feed's tab keys, in Seg order, and its page size. Split from feed.ts so
// the browser script imports them without the mock data.
export const FEED_TABS = ['for-you', 'nearby', 'newest'] as const;
export type FeedTab = (typeof FEED_TABS)[number];
/** 12 fills whole rows at 2, 3 and 4 columns. */
export const FEED_PAGE = 12;
