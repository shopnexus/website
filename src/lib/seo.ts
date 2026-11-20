import { R } from './routes';

// What search engines may read. robots.txt disallows the private paths and
// Layout marks the same pages noindex; the sitemap lists the public ones.

/** Account, deal, posting and sign-in pages and search results, as robots.txt patterns: `*` is any text, `$` the end. */
export const PRIVATE = [
  R.me,
  R.messages,
  R.notifications,
  R.orders,
  R.sales,
  `${R.post}$`,
  `${R.post}?`,
  R.saved,
  R.support,
  '/cod',
  R.login,
  R.logout,
  R.search,
  R.photoSearch,
  R.feed,
  '/api/',
  R.buy('*'),
];

const pattern = (p: string) =>
  new RegExp('^' + p.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*').replace(/\\\$$/, '$'));
const PATTERNS = PRIVATE.map(pattern);

/** Whether robots.txt keeps crawlers off a path with its query. */
export const isPrivate = (path: string) => PATTERNS.some((p) => p.test(path));

/** The public pages that are always there, for the sitemap. */
export const STATIC_PAGES = [R.home, R.categories, R.how, R.sell, R.help, R.plans, R.listingRules, R.terms];

/** The size of a listing's share picture (lib/og-card.tsx). */
export const SHARE_IMAGE = { width: 1200, height: 630 } as const;
