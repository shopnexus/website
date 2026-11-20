import { whileBusy } from './busy';
import { mountChatPane } from './chat-pane';
import { group } from './format';
import { R, loginHref } from './routes';
import { failure } from './skeleton';

// In the browser: Chat nhanh (QuickChat.astro). Links marked data-quickchat
// ("chat", "offer" or a question) open the box mounted last; without one
// they go to Tin nhắn.

let opener: ((what: string) => void) | null = null;

if (!(window as { snQuickChat?: boolean }).snQuickChat) {
  (window as { snQuickChat?: boolean }).snQuickChat = true;
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLElement>('[data-quickchat]');
    if (!a || !opener) return;
    e.preventDefault();
    opener(a.dataset.quickchat!);
  });
}

/** Wires a box and its folded pill; returns how to take them off the page. */
export function mountQuickChat(box: HTMLDialogElement, pill: HTMLButtonElement): () => void {
  const $ = <T extends Element = HTMLElement>(s: string) => box.querySelector<T>(s)!;
  const tray = $<HTMLFormElement>('[data-qc-tray]');
  const offerBtn = $<HTMLButtonElement>('[data-qc-offer]');
  const amount = $<HTMLInputElement>('[data-qc-amount]');
  const price = Number(box.dataset.price);
  const wide = matchMedia('(min-width: 64rem)');
  const full = $<HTMLAnchorElement>('[data-qc-full]');
  const page = new AbortController();

  // The pane's URL: the chat and deal once the first message opened them.
  const paneUrl = () => {
    const u = new URL(box.dataset.pane!, location.origin);
    const meta = box.querySelector<HTMLElement>('[data-part="meta"]');
    if (meta?.dataset.chat) u.searchParams.set('chat', meta.dataset.chat);
    if (meta?.dataset.deal) u.searchParams.set('deal', meta.dataset.deal);
    return u;
  };
  const synced = () => {
    tray.action = paneUrl().pathname + paneUrl().search;
    const meta = box.querySelector<HTMLElement>('[data-part="meta"]');
    if (meta?.dataset.chat) full.href = `${R.messages}?${new URLSearchParams({ chat: meta.dataset.chat, deal: meta.dataset.deal ?? '' })}`;
  };

  // The pane loads on the first open and then follows the chat by itself.
  // Resolves to whether it is in; one that did not load offers "Thử lại".
  const slot = $('[data-qc-pane]');
  const waiting = [...slot.childNodes];
  let loaded: Promise<boolean> | null = null;
  const load = () =>
    (loaded ??= (async () => {
      const res = await fetch(paneUrl(), { headers: { accept: 'text/html' } }).catch(() => null);
      if (res?.redirected || res?.status === 401) {
        location.href = loginHref(location.pathname);
        return false;
      }
      if (!res?.ok) {
        loaded = null;
        const retry = failure(() => {
          slot.replaceChildren(...waiting);
          load();
        });
        retry.classList.add('m-auto');
        slot.replaceChildren(retry);
        return false;
      }
      slot.innerHTML = await res.text();
      synced();
      mountChatPane({
        root: box,
        clean: paneUrl,
        history: false,
        shows: (u) => !!u.deal_id && u.deal_id === box.querySelector<HTMLElement>('[data-part="meta"]')?.dataset.deal,
        afterSwap: synced,
        signal: page.signal,
      });
      return true;
    })());

  const say = async (text: string) => {
    if (!(await load())) return;
    const form = box.querySelector<HTMLFormElement>('[data-composer]');
    const field = form?.querySelector<HTMLTextAreaElement>('[name="text"]');
    if (!form || !field) return;
    field.value = text;
    field.dispatchEvent(new Event('input'));
    form.requestSubmit();
    // A question already asked leaves the chips.
    box.querySelectorAll<HTMLElement>('[data-qc-ask]').forEach((b) => b.dataset.qcAsk === text && b.remove());
  };
  const open = (offer = false) => {
    pill.classList.add('hidden');
    pill.classList.remove('flex');
    if (!box.open) wide.matches ? box.show() : box.showModal();
    setTray(offer);
    load().then((ok) => ok && (offer ? amount : box.querySelector<HTMLTextAreaElement>('[data-composer] [name="text"]'))?.focus({ preventScroll: true }));
  };
  const close = () => box.close();
  const fold = () => {
    box.close();
    pill.classList.remove('hidden');
    pill.classList.add('flex');
  };
  const setTray = (on: boolean) => {
    tray.classList.toggle('hidden', !on);
    offerBtn.setAttribute('aria-expanded', String(on));
  };

  const take = (what: string) => {
    if (what === 'offer') open(true);
    else {
      open();
      if (what !== 'chat') say(what);
    }
  };
  opener = take;
  pill.addEventListener('click', () => open());
  $('[data-qc-close]').addEventListener('click', close);
  $('[data-qc-min]').addEventListener('click', fold);
  // A non-modal dialog has no Esc of its own.
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !box.matches(':modal')) close();
  });
  // The sheet closes on a tap on its backdrop.
  box.addEventListener('click', (e) => {
    if (e.target === box && box.matches(':modal')) {
      const r = box.getBoundingClientRect();
      if (e.clientY < r.top) close();
    }
  });

  box.querySelectorAll<HTMLButtonElement>('[data-qc-ask]').forEach((b) => b.addEventListener('click', () => whileBusy(b, () => say(b.dataset.qcAsk!))));
  offerBtn.addEventListener('click', () => setTray(tray.classList.contains('hidden')));

  const cuts = [...box.querySelectorAll<HTMLButtonElement>('[data-qc-cut]')];
  const mark = (v: number) => cuts.forEach((c) => c.setAttribute('aria-pressed', String(Number(c.dataset.qcCut) === v)));
  cuts.forEach((c) =>
    c.addEventListener('click', () => {
      const v = Number(c.dataset.qcCut);
      amount.value = group(v);
      mark(v);
    }),
  );
  amount.addEventListener('input', () => {
    const v = Number(amount.value.replace(/\D/g, ''));
    amount.value = v ? group(v) : '';
    mark(v);
  });
  // An offer under the price goes in place (chat-pane's data-in-place) and the tray folds once it is in; anything else stays here.
  tray.addEventListener(
    'submit',
    (e) => {
      const v = Number(amount.value.replace(/\D/g, ''));
      if (!v || v >= price) {
        e.preventDefault();
        e.stopImmediatePropagation();
        amount.focus();
      }
    },
    { capture: true },
  );
  tray.addEventListener('sent', () => setTray(false));

  // The left edge drags the docked box wider or narrower; the width is kept per browser.
  const KEY = 'sn:qc-width';
  const clamp = (w: number) => Math.round(Math.min(Math.max(w, 360), Math.min(760, innerWidth - 48)));
  const setWidth = (w: number) => box.style.setProperty('--qc-width', `${clamp(w)}px`);
  try {
    const kept = Number(localStorage.getItem(KEY));
    if (kept) setWidth(kept);
  } catch {
    // Without storage the box opens at its default width.
  }
  const handle = $('[data-qc-resize]');
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    const right = box.getBoundingClientRect().right;
    const move = (m: PointerEvent) => setWidth(right - m.clientX);
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      try {
        localStorage.setItem(KEY, String(box.getBoundingClientRect().width));
      } catch {
        // The width lasts until the page closes.
      }
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
  });

  return () => {
    if (opener === take) opener = null;
    page.abort();
    box.remove();
    pill.remove();
  };
}
