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

/** The page a notice opens. */
export function noticeHref({ kind, id }: Schemas['Target']) {
  switch (kind) {
    case 'deal':
      return `${R.messages}?deal=${id}`;
    case 'order':
      return R.order(id);
    case 'listing':
      return R.listing(id);
    case 'seller_reviews':
      return `${R.seller(id)}#danh-gia`;
    case 'search_watch':
      return `${R.search}?watch=${id}`;
    default:
      return R.me;
  }
}

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
