import { mountGallery } from './gallery';
import { mountQuickChat } from './quick-chat';
import { R } from './routes';
import { failure, hold } from './skeleton';

// In the browser: Xem nhanh (QuickView.astro), opened by a result's "Xem nhanh"
// button. ?view=<slug> is a new history entry: Back closes the drawer, a reload
// or a shared link opens it, and the arrows step through the results in place.

const PARAM = 'view';
/** This document's mark on the entries it pushed: Back from one stays on the page. */
const DOC = Math.random().toString(36).slice(2, 10);

const panel = document.querySelector<HTMLDialogElement>('[data-quick-panel]');
const region = document.querySelector<HTMLElement>('[data-quick-view]');

if (panel && region) {
  const slot = panel.querySelector<HTMLElement>('[data-quick-slot]')!;
  const openLink = panel.querySelector<HTMLAnchorElement>('[data-quick-page]')!;
  const steps = [...panel.querySelectorAll<HTMLButtonElement>('[data-quick-step]')];
  const behind = [...document.querySelectorAll<HTMLElement>('[data-quick-behind]')];
  const wide = matchMedia('(min-width: 840px)');
  const root = document.documentElement;

  let current: string | null = null;
  let run = 0;
  let dropChat: (() => void) | null = null;

  const slugOf = (a: HTMLAnchorElement) => decodeURIComponent(a.pathname.split('/')[2] ?? '');
  /** The results' links in the view that shows (grid or list), in order. */
  const links = () => [...region.querySelectorAll<HTMLAnchorElement>('article a[href^="/listings/"]')].filter((a) => a.offsetParent && a.pathname.split('/').length === 3);
  const linkOf = (slug: string | null) => links().find((a) => slugOf(a) === slug);
  const urlWith = (slug: string | null) => {
    const u = new URL(location.href);
    if (slug) u.searchParams.set(PARAM, slug);
    else u.searchParams.delete(PARAM);
    return u;
  };

  /** The result's "Xem nhanh", or its link where the button is not shown (a phone). */
  const opener = (slug: string | null) => {
    const a = linkOf(slug);
    const b = a?.closest('article')?.querySelector<HTMLButtonElement>('[data-quick]');
    return b?.offsetParent ? b : a;
  };
  /** The drawer is up: the results behind it take no pointer or keyboard. */
  const cover = (on: boolean) => {
    root.toggleAttribute('data-quick-open', on);
    behind.forEach((el) => (el.inert = on));
  };

  const mark = (slug: string | null) => {
    region.querySelectorAll('[data-quick-current]').forEach((el) => el.removeAttribute('data-quick-current'));
    linkOf(slug)?.closest('article')?.setAttribute('data-quick-current', '');
  };
  const syncSteps = () => {
    const list = links();
    const i = list.findIndex((a) => slugOf(a) === current);
    steps.forEach((b) => {
      const to = i < 0 ? -1 : i + Number(b.dataset.quickStep);
      b.disabled = to < 0 || to >= list.length;
    });
  };

  async function load(slug: string) {
    const mine = ++run;
    dropChat?.();
    dropChat = null;
    slot.scrollTop = 0;
    const h = hold(slot, { kind: 'listing', n: 1 });
    try {
      const res = await fetch(`${R.listing(slug)}/quick`, { headers: { accept: 'text/html' } });
      // A listing gone answers 404 with its own line.
      if (!res.ok && res.status !== 404) throw new Error(String(res.status));
      const t = document.createElement('template');
      t.innerHTML = await res.text();
      await h.end();
      if (mine !== run) return;
      const body = t.content.querySelector<HTMLElement>('[data-quick-body]');
      if (!body) throw new Error('empty');
      slot.replaceChildren(body);
      body.querySelectorAll<HTMLElement>('[data-gallery]').forEach(mountGallery);
      // Chat nhanh opens the chat box on this listing until the next one.
      const tools = t.content.querySelector<HTMLElement>('[data-qc]');
      if (tools) dropChat = mountQuickChat(tools);
    } catch {
      await h.end();
      if (mine === run) slot.replaceChildren(failure(() => load(slug)));
    }
  }

  /** Puts the panel up as it stands: the drawer, or the sheet on a phone. The panel takes the focus, not its first button. */
  function reveal() {
    if (wide.matches) {
      panel!.show();
      cover(true);
    } else panel!.showModal();
    panel!.focus({ preventScroll: true });
  }

  /** Opens the panel on a listing, or moves it to another one. */
  function show(slug: string) {
    const fresh = slug !== current;
    current = slug;
    mark(slug);
    syncSteps();
    if (!panel!.open) reveal();
    if (fresh) {
      openLink.href = R.listing(slug);
      load(slug);
    }
  }

  /** Puts the panel away; the result it showed gets the focus back. */
  function hide() {
    const back = opener(current);
    current = null;
    run++;
    dropChat?.();
    dropChat = null;
    mark(null);
    panel!.close();
    cover(false);
    back?.focus({ preventScroll: true });
  }

  /** Close from the panel: Back when this page pushed the entry, else the address loses ?view. */
  function close() {
    const state = (history.state ?? {}) as { quick?: string };
    if (state.quick === DOC) return history.back();
    const { quick: _, ...rest } = state;
    history.replaceState(rest, '', urlWith(null));
    hide();
  }

  function open(slug: string) {
    // Moving within an open panel replaces its entry, so one Back closes it.
    if (current) history.replaceState(history.state, '', urlWith(slug));
    else history.pushState({ ...history.state, quick: DOC }, '', urlWith(slug));
    show(slug);
  }

  // On the document: "Xem thêm tin" adds results after load.
  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-quick]');
    if (b && region.contains(b)) open(b.dataset.quick!);
  });
  steps.forEach((b) =>
    b.addEventListener('click', () => {
      const list = links();
      const to = list[list.findIndex((a) => slugOf(a) === current) + Number(b.dataset.quickStep)];
      if (!to) return;
      open(slugOf(to));
      to.closest('article')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }),
  );
  panel.querySelector('[data-quick-close]')!.addEventListener('click', close);
  document.querySelector('[data-quick-scrim]')!.addEventListener('click', close);
  // The sheet: Esc and a tap on the backdrop.
  panel.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  panel.addEventListener('click', (e) => {
    if (e.target === panel && panel.matches(':modal') && e.clientY < panel.getBoundingClientRect().top) close();
  });
  // The drawer: Esc from anywhere but another dialog or popover.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !current || panel.matches(':modal') || e.defaultPrevented) return;
    const over = (e.target as Element).closest?.('dialog, [popover]');
    if (over && over !== panel) return;
    close();
  });

  addEventListener('popstate', () => {
    const slug = new URL(location.href).searchParams.get(PARAM);
    if (slug) show(slug);
    else if (current) hide();
  });
  // Closed by the page, as when a listing's skeleton takes over; Back from
  // the next page (the page cache) opens it again.
  panel.addEventListener('close', () => {
    if (current && !panel.open) cover(false);
  });
  addEventListener('pageshow', (e) => {
    if (e.persisted && current && !panel.open) reveal();
  });
  // Across 840 px the drawer turns into the sheet or back.
  wide.addEventListener('change', () => {
    if (!current || !panel.open) return;
    panel.close();
    cover(false);
    reveal();
  });

  // A reload or a shared link; the results Back put back (lib/more) are in by DOMContentLoaded.
  const first = new URL(location.href).searchParams.get(PARAM);
  if (first) {
    show(first);
    document.addEventListener('DOMContentLoaded', () => current && (mark(current), syncSteps()), { once: true });
  }
}
