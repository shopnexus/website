import { whileBusy } from './busy';
import { type DockChat, dockPane, openDock, provide } from './chat-dock';
import { group } from './format';

// In the browser: Chat nhanh (QuickChat.astro). Links marked data-quickchat
// ("chat", "offer" or a question) open the chat box on the listing mounted
// last, with its chips and offer tray; without one they go to Tin nhắn.

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

/** Wires a listing's chips and offer tray (taken off the page into the box when it opens); returns how to take them away. */
export function mountQuickChat(box: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(s: string) => box.querySelector<T>(s)!;
  const tray = $<HTMLFormElement>('[data-qc-tray]');
  const offerBtn = $<HTMLButtonElement>('[data-qc-offer]');
  const amount = $<HTMLInputElement>('[data-qc-amount]');
  const price = Number(box.dataset.price);
  const listing = box.dataset.listing!;
  let chatId = box.dataset.chat ?? '';
  box.remove();
  box.hidden = false;

  // The offer posts to the pane as it stands: the chat and deal once the first message opened them.
  const synced = () => {
    tray.action = dockPane();
    chatId = new URL(tray.action, location.origin).searchParams.get('chat') ?? chatId;
  };
  const chat: DockChat = { pane: box.dataset.pane!, tools: box, afterSwap: synced };
  const drop = provide({ has: (c, l) => l === listing || (!!chatId && c === chatId), chat });

  const say = async (text: string) => {
    if (!(await openDock(chat))) return;
    const form = document.querySelector<HTMLFormElement>('[data-dock] [data-composer]');
    const field = form?.querySelector<HTMLTextAreaElement>('[name="text"]');
    if (!form || !field) return;
    field.value = text;
    field.dispatchEvent(new Event('input'));
    form.requestSubmit();
    // A question already asked leaves the chips.
    box.querySelectorAll<HTMLElement>('[data-qc-ask]').forEach((b) => b.dataset.qcAsk === text && b.remove());
  };
  const open = (offer = false) => {
    setTray(offer);
    openDock(chat, { focus: !offer }).then((ok) => ok && offer && amount.focus({ preventScroll: true }));
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

  return () => {
    if (opener === take) opener = null;
    drop();
  };
}
