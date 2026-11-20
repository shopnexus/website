import { mountChatPane } from './chat-pane';
import { leaves } from './leaves';
import { R, loginHref } from './routes';
import { failure } from './skeleton';
import { connectSocket } from './socket';

// In the browser: the chat box (ChatDock.astro). From 840 px a chat in the
// header's Tin nhắn panel opens in it; below, or with a modifier or middle
// click, the row stays a link to Tin nhắn. Chat nhanh opens it on a listing.
// It shows /messages/pane, run by lib/chat-pane. One chat at a time: another
// replaces it. The chat open or folded is kept in sessionStorage for the
// visit, and the next page opens it again from 840 px.

export interface DockChat {
  /** /messages/pane with ?chat= (and ?deal=), or ?listing= for Chat nhanh. */
  pane: string;
  /** Shown under the thread while this chat is in the box: Chat nhanh's chips and offer tray. */
  tools?: HTMLElement;
  /** After each render of the pane, the first one included. */
  afterSwap?: () => void;
}

/** A page's own way to open some chats: Chat nhanh on its listing, with its tools. */
export interface Provider {
  has(chat: string, listing: string): boolean;
  chat: DockChat;
}

interface Kept {
  pane: string;
  folded: boolean;
  name: string;
  /** The face's markup, for the pill before the pane is in. */
  face: string;
}

const KEPT = 'sn:dock';
const WIDTH = 'sn:dock-width';
const wide = matchMedia('(min-width: 840px)');
const providers = new Set<Provider>();

const store = {
  get(): Kept | null {
    try {
      return JSON.parse(sessionStorage.getItem(KEPT) ?? 'null');
    } catch {
      return null;
    }
  },
  set(k: Kept | null) {
    try {
      if (k) sessionStorage.setItem(KEPT, JSON.stringify(k));
      else sessionStorage.removeItem(KEPT);
    } catch {
      // Without storage the box stays on this page only.
    }
  },
};

const param = (pane: string, k: string) => new URL(pane, location.origin).searchParams.get(k) ?? '';

/** The way a page opens this chat if it has one, the plain pane otherwise. */
function chatFor(pane: string): DockChat {
  const [chat, listing] = [param(pane, 'chat'), param(pane, 'listing')];
  for (const p of providers) if (p.has(chat, listing)) return p.chat;
  return { pane };
}

/** Whether two chats are the same: one provider's, or plain panes on one conversation. */
const same = (a: DockChat, b: DockChat) => a === b || (!a.tools && !b.tools && !!param(a.pane, 'chat') && param(a.pane, 'chat') === param(b.pane, 'chat'));

function mount(box: HTMLDialogElement, pill: HTMLButtonElement) {
  const $ = <T extends Element = HTMLElement>(s: string) => box.querySelector<T>(s);
  const slot = $('[data-dock-pane]')!;
  const tools = $('[data-dock-tools]')!;
  const full = $<HTMLAnchorElement>('[data-dock-full]')!;
  // What a box on its way shows: a blank head and ref, bubbles in the pane.
  const blank = {
    head: $('[data-part="head"]')!.cloneNode(true),
    ref: $('[data-part="ref"]')!.cloneNode(true),
    pane: [...slot.childNodes],
  };
  const waiting = () => blank.pane.map((n) => n.cloneNode(true));
  /** The chat in the box, open or folded. */
  let shown: DockChat | null = null;
  /** Ends the mounted pane's listeners. */
  let pane: AbortController | null = null;
  let loaded: Promise<boolean> | null = null;

  const meta = () => $('[data-part="meta"]');
  const head = () => $('[data-part="head"]');
  /** The pane's URL: the chat and deal once the pane has them (a first message on a listing opens them). */
  const paneUrl = () => {
    const u = new URL(shown!.pane, location.origin);
    const m = meta();
    if (m?.dataset.chat) u.searchParams.set('chat', m.dataset.chat);
    if (m?.dataset.deal) u.searchParams.set('deal', m.dataset.deal);
    return u;
  };
  const address = () => (shown ? `${paneUrl().pathname}${paneUrl().search}` : '');
  const chatId = () => meta()?.dataset.chat || (shown ? param(shown.pane, 'chat') : '');

  const keep = () => {
    if (!shown) return;
    const old = store.get();
    store.set({
      pane: address(),
      folded: !box.open,
      name: head()?.dataset.name ?? old?.name ?? '',
      face: head()?.querySelector('[data-dock-face]')?.innerHTML ?? old?.face ?? '',
    });
  };

  const synced = () => {
    full.href = meta()?.dataset.full ?? R.messages;
    box.setAttribute('aria-label', head()?.dataset.name ? `Chat với ${head()!.dataset.name}` : 'Chat');
    keep();
    shown?.afterSwap?.();
  };

  const unmount = () => {
    pane?.abort();
    pane = null;
    loaded = null;
  };

  /** Puts a pane in: the head and ref in their places above, the header's badge in the header, the rest in the pane's slot. */
  const place = (html: string) => {
    const t = document.createElement('template');
    t.innerHTML = html;
    for (const part of [...t.content.children] as HTMLElement[]) {
      if (!part.dataset.part) continue;
      const sel = `[data-part="${part.dataset.part}"]`;
      if (part.dataset.part === 'messages-badge') {
        const badge = document.querySelector(sel);
        if (badge) badge.replaceWith(part);
        else part.remove();
        continue;
      }
      const spot = $(sel);
      if (spot && !slot.contains(spot)) spot.replaceWith(part);
    }
    slot.replaceChildren(t.content);
  };

  // The pane loads on open and then follows the chat by itself. Resolves to
  // whether it is in; one that did not load offers "Thử lại".
  const load = () =>
    (loaded ??= (async () => {
      const ctl = new AbortController();
      pane = ctl;
      const res = await fetch(new URL(shown!.pane, location.origin), {
        headers: { accept: 'text/html' },
      }).catch(() => null);
      const html = res?.ok && !res.redirected ? await res.text() : '';
      // Another chat took the box meanwhile.
      if (ctl.signal.aborted) return false;
      if (res?.redirected || res?.status === 401) {
        location.href = loginHref(location.pathname);
        return false;
      }
      if (!html) {
        loaded = null;
        const retry = failure(() => {
          slot.replaceChildren(...waiting());
          load();
        });
        retry.classList.add('m-auto');
        slot.replaceChildren(retry);
        return false;
      }
      place(html);
      mountChatPane({
        root: box,
        clean: paneUrl,
        history: false,
        shows: (u) => !!u.deal_id && u.deal_id === meta()?.dataset.deal,
        afterSwap: synced,
        signal: ctl.signal,
      });
      synced();
      return true;
    })());

  const pillShown = () => pill.classList.contains('flex');
  const showPill = (name: string, face: string) => {
    pill.querySelector('[data-dock-pill-face]')!.innerHTML = face;
    pill.querySelector('[data-dock-pill-name]')!.textContent = name;
    pill.setAttribute('aria-label', `Mở chat với ${name}`);
    pill.removeAttribute('data-new');
    pill.classList.replace('hidden', 'flex');
  };
  const hidePill = () => pill.classList.replace('flex', 'hidden');

  /** The chat leaves the box. */
  const clear = () => {
    unmount();
    shown = null;
    tools.replaceChildren();
    store.set(null);
  };

  async function open(c: DockChat, { focus = true } = {}) {
    if (!shown || !same(shown, c)) {
      unmount();
      shown = c;
      head()!.replaceWith(blank.head.cloneNode(true));
      $('[data-part="ref"]')!.replaceWith(blank.ref.cloneNode(true));
      slot.replaceChildren(...waiting());
      tools.replaceChildren(...(c.tools ? [c.tools] : []));
    }
    hidePill();
    if (!box.open) wide.matches ? box.show() : box.showModal();
    keep();
    const ok = await load();
    if (ok && focus && shown === c) $<HTMLTextAreaElement>('[data-composer] [name="text"]')?.focus({ preventScroll: true });
    return ok;
  }

  function close(c?: DockChat) {
    if (!shown || (c && shown !== c)) return;
    hidePill();
    if (box.open) box.close();
    else clear();
  }

  const fold = () => {
    showPill(head()?.dataset.name ?? '', head()?.querySelector('[data-dock-face]')?.innerHTML ?? '');
    unmount();
    box.close();
    keep();
  };

  // Closed (×, Esc, the sheet's backdrop) rather than folded.
  box.addEventListener('close', () => !box.open && !pillShown() && clear());
  $('[data-dock-close]')!.addEventListener('click', () => close());
  $('[data-dock-fold]')!.addEventListener('click', fold);
  pill.addEventListener('click', () => shown && open(shown));
  // A non-modal dialog has no Esc of its own.
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !box.matches(':modal')) close();
  });
  box.addEventListener('click', (e) => {
    // The sheet closes on a tap on its backdrop.
    if (e.target === box && box.matches(':modal') && e.clientY < box.getBoundingClientRect().top) close();
    // Off to Tin nhắn: the chat goes on there, not in the box on the next page.
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-dock-leave]');
    if (a && leaves(a, e)) store.set(null);
  });

  // A folded chat that gets a message says so on its pill.
  document.addEventListener('sn:update', (e) => {
    const f = (e as CustomEvent<{ kind: string; conversation_id?: string }>).detail;
    if (pillShown() && f.kind === 'message' && !!f.conversation_id && f.conversation_id === chatId()) pill.setAttribute('data-new', '');
  });

  // A chat in the header's Tin nhắn panel opens here from 840 px.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('[data-dock-rows] a[data-open]');
    if (!a || !wide.matches || !leaves(a, e)) return;
    e.preventDefault();
    a.closest<HTMLElement>('[popover]')?.hidePopover();
    const u = new URL(a.href);
    open(chatFor(`/messages/pane?${new URLSearchParams({ chat: u.searchParams.get('chat') ?? '', deal: u.searchParams.get('deal') ?? '' })}`));
  });

  // The left edge drags the docked box wider or narrower; the width is kept per browser.
  const clamp = (w: number) => Math.round(Math.min(Math.max(w, 360), Math.min(760, innerWidth - 48)));
  const setWidth = (w: number) => box.style.setProperty('--dock-width', `${clamp(w)}px`);
  try {
    const w = Number(localStorage.getItem(WIDTH));
    if (w) setWidth(w);
  } catch {
    // Without storage the box opens at its default width.
  }
  const handle = $('[data-dock-resize]')!;
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    const right = box.getBoundingClientRect().right;
    const move = (m: PointerEvent) => setWidth(right - m.clientX);
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      try {
        localStorage.setItem(WIDTH, String(box.getBoundingClientRect().width));
      } catch {
        // The width lasts until the page closes.
      }
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
  });

  // The kept chat comes back once the page's own chats (Chat nhanh) are known.
  const restore = () => {
    const k = store.get();
    if (!k || !wide.matches) return;
    const c = chatFor(k.pane);
    if (!k.folded) return void open(c, { focus: false });
    shown = c;
    tools.replaceChildren(...(c.tools ? [c.tools] : []));
    showPill(k.name, k.face);
    connectSocket();
  };
  if (document.readyState === 'complete') restore();
  else addEventListener('DOMContentLoaded', restore, { once: true });

  return { open, close, address };
}

const boxEl = document.querySelector<HTMLDialogElement>('[data-dock]');
const pillEl = document.querySelector<HTMLButtonElement>('[data-dock-pill]');
// Signed out there is no box. Tin nhắn and Hỗ trợ run their own chat over the whole page, so chats stay there.
const fullChat = location.pathname === R.messages || location.pathname === R.support;
const dock = boxEl && pillEl && !fullChat ? mount(boxEl, pillEl) : null;

/** Opens a chat in the box, or brings back the one it holds; resolves to whether its pane loaded. */
export const openDock = (c: DockChat, o?: { focus?: boolean }) => dock?.open(c, o) ?? Promise.resolve(false);

/** The address of the pane in the box, for a form that posts to it. */
export const dockPane = () => dock?.address() ?? '';

/** Adds a page's way to open its chats; returns how to take it away, which also closes the box on its chat. */
export function provide(p: Provider): () => void {
  providers.add(p);
  return () => {
    providers.delete(p);
    dock?.close(p.chat);
  };
}
