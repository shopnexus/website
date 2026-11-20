import type { Schemas } from './api/client';
import { dayLabel } from './format';
import { R } from './routes';

// Thông báo's rows: how each type looks, where it opens, and the day groups.

type Notice = Schemas['Notification'];
type Tone = 'offer' | 'deal' | 'neutral';

export const TONES: Record<Tone, string> = {
  offer: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  deal: 'bg-primary/10 text-primary',
  neutral: 'bg-surface-container-low text-on-surface-variant',
};

// By type; the compiler names a type the server adds, and an unknown one at run time gets the bell.
const LOOK: Record<Notice['type'], [string, Tone]> = {
  offer: ['sell-outline-rounded', 'offer'],
  counter: ['sell-outline-rounded', 'offer'],
  agreed: ['handshake-outline-rounded', 'deal'],
  declined: ['cancel-outline-rounded', 'neutral'],
  agreement_cancelled: ['cancel-outline-rounded', 'neutral'],
  offer_voided: ['cancel-outline-rounded', 'neutral'],
  cod_requested: ['receipt-long-outline-rounded', 'deal'],
  shipped: ['local-shipping-outline-rounded', 'deal'],
  completed: ['check-circle-outline-rounded', 'deal'],
  failed: ['error-outline-rounded', 'neutral'],
  order_cancelled: ['cancel-outline-rounded', 'neutral'],
  listing_live: ['storefront-outline-rounded', 'deal'],
  listing_rejected: ['report-outline-rounded', 'neutral'],
  followed_listing: ['person-add-outline-rounded', 'neutral'],
  review: ['star-outline-rounded', 'neutral'],
  review_reply: ['reply-rounded', 'neutral'],
  suspended: ['block-rounded', 'neutral'],
  unsuspended: ['verified-user-outline-rounded', 'deal'],
  watch_matched: ['search-rounded', 'deal'],
  price_dropped: ['trending-down-rounded', 'deal'],
};

export const look = (k: string): readonly [string, Tone] => LOOK[k as keyof typeof LOOK] ?? (['notifications-outline-rounded', 'neutral'] as const);

/**
 * The page each target kind opens, `{id}` standing for its ID. A push carries
 * the same kinds, chats included, and the service worker reads this table
 * (pages/sw.js.ts); a kind without a page opens Tôi.
 */
export const TARGETS: Record<string, string> = {
  deal: `${R.messages}?deal={id}`,
  order: R.order('{id}'),
  listing: R.listing('{id}'),
  seller_reviews: `${R.seller('{id}')}#danh-gia`,
  search_watch: `${R.search}?watch={id}`,
  conversation: `${R.messages}?chat={id}`,
  ticket: `${R.support}?ticket={id}`,
};
export const OTHER_TARGET = R.me;

/** The page a notice opens. */
export const noticeHref = ({ kind, id }: Schemas['Target']) => TARGETS[kind]?.replace('{id}', id) ?? OTHER_TARGET;

/** The notices by day, newest first, as the server sends them. */
export function byDay(items: Notice[]): [string, Notice[]][] {
  const groups: [string, Notice[]][] = [];
  for (const n of items) {
    const label = dayLabel(n.at);
    const last = groups.at(-1);
    if (last?.[0] === label) last[1].push(n);
    else groups.push([label, [n]]);
  }
  return groups;
}
