import type { AstroGlobal } from 'astro';
import { type Api, ApiError, orNull, pageOrFirst, type Schemas, unwrap } from './api/client';
import { TZ, dayLabel, decimal, money } from './format';
import { isId } from './listing';
import { R } from './routes';

// Tin nhắn's reading and its words: the inbox, the open chat and its deals,
// the thread as groups of bubbles, deal moves and events.

export type Chat = Schemas['ChatScreen'];
export type Deal = Schemas['Deal'];
export type Message = Schemas['Message'];
export type InboxItem = Schemas['InboxItem'];
export type Person = Schemas['Person'];

/** A person as the chat names them. */
export const personName = (p: Person) => (p.official ? 'ShopNexus' : p.deleted ? 'Tài khoản đã xóa' : p.display_name || 'Người dùng');

/** A person's page; none for ShopNexus or a deleted account. */
export const personHref = (p: Pick<Person, 'id' | 'official' | 'deleted'>) => (p.official || p.deleted ? undefined : R.seller(p.id));

/** 14:05, in Vietnam's time. */
export const hm = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ });

/** An inbox row's time: the hour today, the day label before. */
export const when = (iso: string) => (dayLabel(iso) === 'Hôm nay' ? hm(iso) : dayLabel(iso));

/** "5,1 tr" from a million, "650.000 ₫" below. */
export const shortPrice = (v: number) => (v >= 1_000_000 ? `${decimal(v / 1_000_000, 2)} tr` : money(v));

/** "Đang hoạt động" under 5 minutes, then how long ago; nothing before the first time. */
export function activeText(p: Person, now = Date.now()) {
  if (!p.last_active_at || p.official || p.deleted) return '';
  const m = Math.floor((now - Date.parse(p.last_active_at)) / 60_000);
  if (m < 5) return 'Đang hoạt động';
  if (m < 60) return `Hoạt động ${m} phút trước`;
  if (m < 1440) return `Hoạt động ${Math.floor(m / 60)} giờ trước`;
  return `Hoạt động ${Math.floor(m / 1440)} ngày trước`;
}

/** The deal's step on the four-step bar: price, order, receipt, review. */
export function phase(d: Pick<Deal, 'status' | 'order'>) {
  if (d.status === 'sold' || d.order?.status === 'completed') return 3;
  if (d.order?.status === 'pending' || d.order?.status === 'shipped') return 2;
  return d.status === 'agreed' ? 1 : 0;
}

export const ORDER_STATUS: Record<Schemas['OrderStatus'], [string, string]> = {
  pending: ['receipt-long-outline-rounded', 'Chờ tạo đơn'],
  shipped: ['local-shipping-outline-rounded', 'Đang giao'],
  completed: ['check-circle-outline-rounded', 'Đã nhận hàng'],
  failed: ['error-outline-rounded', 'Giao không thành công'],
  cancelled: ['cancel-outline-rounded', 'Đơn đã hủy'],
};

/** What a listing that is not on sale says on its deal. */
export const LISTING_STATUS: Partial<Record<Schemas['ListingStatus'], string>> = {
  reserved: 'Đang giao cho một người mua',
  sold: 'Đã bán',
  hidden: 'Tin đang ẩn',
  deleted: 'Tin đã xóa',
  processing: 'Tin đang xử lý',
  rejected: 'Tin bị từ chối',
};

/** A deal message that is not a price: what happened, as one line. who is "Bạn" or the other's name. */
export function moveText(m: Schemas['Move'], who: string): [string, string] {
  const amount = m.amount ? money(m.amount) : '';
  switch (m.kind) {
    case 'decline':
      return ['cancel-outline-rounded', `${who} từ chối giá`];
    case 'withdraw':
      return ['undo-rounded', `${who} rút lại giá`];
    case 'cancel':
      return ['cancel-outline-rounded', `${who} hủy giá đã chốt`];
    case 'price_changed':
      return ['sell-outline-rounded', amount ? `Giá đăng đổi thành ${amount}` : 'Giá đăng đã đổi'];
    case 'offers_closed':
      return ['sell-outline-rounded', 'Người bán tắt trả giá'];
    case 'listing_closed':
      return ['storefront-outline-rounded', 'Tin đã ngừng bán'];
    case 'cod_requested':
      return ['receipt-long-outline-rounded', amount ? `Đã gửi yêu cầu COD · ${amount}` : 'Đã gửi yêu cầu COD'];
    case 'shipped':
      return ['local-shipping-outline-rounded', 'Người bán đã gửi hàng'];
    case 'shipment_updated':
      return ['local-shipping-outline-rounded', 'Đơn vị vận chuyển cập nhật đơn'];
    case 'completed':
      return ['check-circle-outline-rounded', 'Đã nhận hàng'];
    case 'failed':
      return ['error-outline-rounded', 'Giao không thành công'];
    case 'order_cancelled':
      return ['cancel-outline-rounded', 'Đơn đã hủy'];
    case 'accept':
      return ['handshake-outline-rounded', amount ? `Chốt ${amount}` : 'Đã chốt giá'];
    default:
      return ['sell-outline-rounded', amount ? `${who} trả ${amount}` : `${who} trả giá`];
  }
}

/** The line an inbox row shows for its last message. */
export function preview(m: Message, me: string, other: Person) {
  const mine = m.sender_id === me;
  if (m.deal) {
    const who = m.deal.move.by === 'system' ? '' : mine ? 'Bạn' : personName(other);
    return moveText(m.deal.move, who)[1].trim();
  }
  const body = m.text || (m.photos.length ? `Đã gửi ${m.photos.length > 1 ? `${m.photos.length} ảnh` : 'ảnh'}` : '');
  return mine ? `Bạn: ${body}` : body;
}

/** The inbox row's tag: the deal's order, or its price. */
export function dealTag(d: Schemas['DealSummary'] | undefined): [string, string] | undefined {
  if (!d) return undefined;
  if (d.order_status) return ORDER_STATUS[d.order_status];
  if (d.status === 'sold' && d.agreed_price) return ['check-circle-outline-rounded', shortPrice(d.agreed_price)];
  if (d.status === 'agreed' && d.agreed_price) return ['handshake-outline-rounded', shortPrice(d.agreed_price)];
  if (d.open_price) return ['sell-outline-rounded', d.your_turn ? `Chờ bạn · ${shortPrice(d.open_price.amount)}` : shortPrice(d.open_price.amount)];
  return undefined;
}

/** A listing title cut for a deal chip and a move's line. */
export const shortTitle = (t: string) => (t.length > 24 ? `${t.slice(0, 22).trimEnd()}…` : t);

// ---------------------------------------------------------------- thread --

export type ThreadItem =
  | { kind: 'day'; label: string }
  | { kind: 'group'; side: 'mine' | 'theirs'; messages: Message[]; time: string }
  | { kind: 'move'; side: 'mine' | 'theirs'; amount: string; time: string; accept: boolean }
  | { kind: 'event'; icon: string; text: string };

const GAP = 5 * 60_000;

/**
 * The messages, oldest first, as the thread shows them: a day line where the
 * day changes, a sender's run within 5 minutes as one group with the time
 * under it, a price as a pill and any other move as an event line.
 */
export function thread(items: Message[], chat: Pick<Chat, 'other' | 'deals' | 'other_read_message_id'>, me: string): ThreadItem[] {
  const out: ThreadItem[] = [];
  const titles = new Map(chat.deals.map((d) => [d.id, shortTitle(d.listing.title)]));
  const named = chat.deals.length > 1;
  const other = personName(chat.other);
  // "Đã xem" goes under the last of my messages the other has read.
  const readAt = chat.other_read_message_id ? items.findIndex((m) => m.id === chat.other_read_message_id) : -1;
  let seenId = '';
  if (readAt >= 0) seenId = items.slice(0, readAt + 1).findLast((m) => m.sender_id === me && !m.deal)?.id ?? '';
  let day = '';
  let last: Message | undefined;
  for (const m of items) {
    const label = dayLabel(m.created_at);
    if (label !== day) {
      out.push({ kind: 'day', label });
      day = label;
      last = undefined;
    }
    const side = m.sender_id === me ? 'mine' : 'theirs';
    const move = m.deal?.move;
    if (move) {
      const item = titles.get(m.deal!.deal_id);
      const prefix = named && item ? `${item} · ` : '';
      if (move.kind === 'offer' || move.kind === 'counter' || (move.kind === 'accept' && move.by !== 'system')) {
        out.push({ kind: 'move', side, amount: move.amount ? money(move.amount) : '', time: prefix + hm(m.created_at), accept: move.kind === 'accept' });
      } else {
        const who = move.by === 'system' ? '' : side === 'mine' ? 'Bạn' : other;
        const [icon, text] = moveText(move, who);
        out.push({ kind: 'event', icon, text: prefix + text.trim() });
      }
      last = undefined;
      continue;
    }
    const prev = out.at(-1);
    if (last && prev?.kind === 'group' && prev.side === side && Date.parse(m.created_at) - Date.parse(last.created_at) < GAP) {
      prev.messages.push(m);
    } else {
      out.push({ kind: 'group', side, messages: [m], time: '' });
    }
    last = m;
  }
  // Each group's line: the last message's time and what became of it.
  for (const g of out) {
    if (g.kind !== 'group') continue;
    const end = g.messages.at(-1)!;
    const status = end.status === 'processing' ? 'Đang gửi' : end.status === 'failed' ? 'Không gửi được' : g.messages.some((m) => m.id === seenId) ? 'Đã xem' : '';
    g.time = [hm(end.created_at), status].filter(Boolean).join(' · ');
  }
  return out;
}

// ---------------------------------------------------------------- errors --

export { errorText } from './chat-errors';

/** The server's code for a refusal; 'unknown' when the outcome is unclear (no answer, or a 5xx), so a retry keeps its key. */
export const errorCode = (e: unknown) => (e instanceof ApiError && e.status < 500 ? e.code : 'unknown');

// ----------------------------------------------------------------- loads --

/** The buyer's deal on a listing, opened when there is none. */
export const openDeal = (api: Api, listing: string) => unwrap(api.POST('/v1/deals', { body: { listing_id: listing } }));

export interface Inbox {
  inbox: Schemas['InboxScreen'];
  archived: boolean;
  /** The search's matches, null outside a search; invalid when the query holds no letter. */
  found: Schemas['InboxSearch'] | null;
  q: string;
}

export interface Messages extends Inbox {
  chat: Chat | null;
  /** The deal the chat shows first. */
  deal: Deal | null;
  /** This render marked the chat read, so the socket echoes a read update. */
  marked: boolean;
}

type Ctx = Pick<AstroGlobal, 'locals' | 'url'>;

/** The inbox list for the query: a page of conversations, archived ones, or a search. */
export async function loadInbox({ locals, url }: Ctx): Promise<Inbox> {
  const api = locals.api;
  const p = url.searchParams;
  const q = (p.get('q') ?? '').trim();
  const archived = p.has('archived');
  const [inbox, found] = await Promise.all([
    pageOrFirst(p.get('after') ?? undefined, (cursor) =>
      api.GET('/v1/screens/inbox', { params: { query: { archived: archived || undefined, cursor, limit: 30 } } }),
    ),
    q ? orNull(api.GET('/v1/screens/inbox/search', { params: { query: { q, limit: 30 } } }), [400, 422]) : null,
  ]);
  if (locals.viewer) locals.viewer.unread.messages = inbox.unread;
  return { inbox, archived, found, q };
}

/** The page's reads for its query; the open chat is marked read when `read`. */
export async function loadMessages(ctx: Ctx, read: boolean): Promise<Messages> {
  const { locals, url } = ctx;
  const api = locals.api;
  const p = url.searchParams;
  const id = p.get('chat') ?? '';
  const [list, chat] = await Promise.all([
    loadInbox(ctx),
    isId(id) ? orNull(api.GET('/v1/screens/chat/{conversation_id}', { params: { path: { conversation_id: id } } })) : null,
  ]);
  const { inbox } = list;
  let marked = false;
  if (chat && read) {
    const row = inbox.items.find((r) => r.id === chat.id);
    const newest = chat.messages.items.find((m) => m.status === 'sent');
    if (newest && (row?.unread ?? 1) > 0) {
      await orNull(api.POST('/v1/conversations/{id}/read', { params: { path: { id: chat.id } }, body: { message_id: newest.id } }));
      marked = true;
      if (row) {
        inbox.unread = Math.max(0, inbox.unread - row.unread);
        row.unread = 0;
      }
    }
  }
  // The header's badge follows the inbox, read marks included.
  if (locals.viewer) locals.viewer.unread.messages = inbox.unread;
  const want = p.get('deal');
  const rowDeal = inbox.items.find((r) => r.id === chat?.id)?.deal?.id;
  const deal = chat ? (chat.deals.find((d) => d.id === want) ?? chat.deals.find((d) => d.id === rowDeal) ?? chat.deals[0] ?? null) : null;
  return { ...list, chat, deal, marked };
}

/** Tin nhắn on a chat, its deal first. */
export const chatHref = (chat: string, deal?: string, extra: Record<string, string> = {}) =>
  `${R.messages}?${new URLSearchParams({ chat, ...(deal ? { deal } : {}), ...extra })}`;
