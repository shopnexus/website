import { syncFollows } from './follow';
import { failure, hold } from './skeleton';

// In the browser: a link to a person's page marked data-person shows their
// card (PersonCard) once a mouse rests on it, or keyboard focus stays on it,
// for 300 ms. Each card loads once a page from <their page>/peek. A touch
// screen gets no card; a tap opens the page.

const OPEN_AFTER = 300;
/** A short rest before asking for the card, so sweeping past links asks for nothing. */
const FETCH_AFTER = 100;
/** Time for the pointer to cross from the link into the card. */
const GRACE = 200;
const GAP = 8;
const EDGE = 16;
const FOCUSABLE = 'a[href], button:not(:disabled), input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]';

const card = document.getElementById('person-card');
const body = card?.querySelector<HTMLElement>('[data-person-body]');
const mouse = matchMedia('(hover: hover) and (pointer: fine)');

/** Cards by partial address: asked for, and the ones in. */
const asked = new Map<string, Promise<HTMLElement>>();
const ready = new Map<string, HTMLElement>();

/** The link the card shows for, and the one it is about to open for. */
let shown: HTMLAnchorElement | null = null;
let coming: HTMLAnchorElement | null = null;
/** A link whose card was closed with Esc; it stays shut until left. */
let quiet: HTMLAnchorElement | null = null;
let opening: number[] = [];
let closing: number | undefined;

const src = (a: HTMLAnchorElement) => `${a.pathname}/peek`;
const linkOf = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLAnchorElement>('a[data-person]') : null);
const inCard = (t: EventTarget | null) => t instanceof Node && !!card?.contains(t);
const isOpen = () => !!card?.matches(':popover-open');

function load(a: HTMLAnchorElement): Promise<HTMLElement> {
  const at = src(a);
  let p = asked.get(at);
  if (!p) {
    p = fetch(at, { headers: { accept: 'text/html' } }).then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      const t = document.createElement('template');
      t.innerHTML = await res.text();
      const el = t.content.querySelector<HTMLElement>('[data-person-card]');
      if (!el) throw new Error('no card');
      ready.set(at, el);
      return el;
    });
    // A card that did not load is asked for again next time.
    p.catch(() => asked.delete(at));
    asked.set(at, p);
  }
  return p;
}

/** Under the link, or above it when only above has room; inside the window. */
function place(a: HTMLAnchorElement) {
  const r = a.getBoundingClientRect();
  const below = innerHeight - r.bottom - GAP - EDGE;
  const up = card!.offsetHeight > below && r.top - GAP - EDGE > below;
  const maxLeft = document.documentElement.clientWidth - card!.offsetWidth - EDGE;
  Object.assign(card!.style, {
    top: up ? 'auto' : `${r.bottom + GAP}px`,
    bottom: up ? `${innerHeight - r.top + GAP}px` : 'auto',
    left: `${Math.max(EDGE, Math.min(r.left, maxLeft))}px`,
    transformOrigin: up ? 'bottom left' : 'top left',
  });
}

function fill(el: HTMLElement) {
  syncFollows(el);
  body!.replaceChildren(el);
  card!.setAttribute('aria-label', el.querySelector('[data-person-name]')?.textContent ?? '');
}

async function show(a: HTMLAnchorElement) {
  clearTimeout(closing);
  shown = a;
  const pending = load(a);
  const cached = ready.get(src(a));
  if (cached) fill(cached);
  const h = cached ? null : hold(body!, { kind: 'person', delay: 0 });
  if (!isOpen()) card!.showPopover();
  place(a);
  if (!h) return;
  try {
    const el = await pending;
    await h.end();
    if (shown === a) fill(el);
  } catch {
    await h.end();
    if (shown === a) body!.replaceChildren(failure(() => show(a)));
  }
  if (shown === a) place(a);
}

function close() {
  clearTimeout(closing);
  shown = null;
  if (isOpen()) card!.hidePopover();
}

function cancelOpen() {
  opening.forEach(clearTimeout);
  opening = [];
  coming = null;
}

/** Closes the card and forgets the one on its way. */
function hide() {
  cancelOpen();
  close();
}

/** The pointer or focus came to a person's link. */
function arm(a: HTMLAnchorElement) {
  if (a === quiet || a.pathname === location.pathname) return;
  if (a === shown) clearTimeout(closing);
  if (a === shown || a === coming) return;
  cancelOpen();
  coming = a;
  opening = [
    window.setTimeout(() => load(a), FETCH_AFTER),
    window.setTimeout(() => {
      coming = null;
      show(a);
    }, OPEN_AFTER),
  ];
}

/** The pointer or focus left the link and the card. */
function leave() {
  quiet = null;
  cancelOpen();
  if (!shown) return;
  clearTimeout(closing);
  closing = window.setTimeout(close, GRACE);
}

/** Focus to whatever follows the link in tab order, leaving the card behind. */
function focusAfter(a: HTMLAnchorElement) {
  const next = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].find(
    (el) => el.tabIndex >= 0 && !inCard(el) && !a.contains(el) && a.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && el.checkVisibility(),
  );
  next?.focus();
}

if (card && body && 'showPopover' in card) {
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' || !mouse.matches) return;
    const a = linkOf(e.target);
    if (a) arm(a);
    else if (inCard(e.target)) clearTimeout(closing);
  });
  document.addEventListener('pointerout', (e) => {
    if (e.pointerType !== 'mouse') return;
    const from = linkOf(e.target) ?? (inCard(e.target) ? card : null);
    const to = e.relatedTarget;
    // Moving inside the link or the card, or between the card and its link, keeps it.
    if (!from || (to instanceof Node && (from.contains(to) || inCard(to) || shown?.contains(to)))) return;
    leave();
  });
  document.addEventListener('focusin', (e) => {
    const a = linkOf(e.target);
    if (a?.matches(':focus-visible')) arm(a);
    else if (inCard(e.target)) clearTimeout(closing);
    else if ((shown || coming) && !card.matches(':hover')) leave();
  });
  document.addEventListener('keydown', (e) => {
    if (!isOpen() || !shown) return;
    const a = shown;
    const at = document.activeElement;
    if (e.key === 'Escape') {
      quiet = a;
      hide();
      if (inCard(at)) a.focus();
      return;
    }
    // Tab goes from the link into the card, and out of it to what follows the link.
    if (e.key !== 'Tab') return;
    const items = [...card.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!items.length) return;
    let to: (() => void) | null = null;
    if (at === a && !e.shiftKey) to = () => items[0].focus();
    else if (at === items[0] && e.shiftKey) to = () => a.focus();
    else if (at === items.at(-1) && !e.shiftKey)
      to = () => {
        hide();
        focusAfter(a);
      };
    if (!to) return;
    e.preventDefault();
    to();
  });
  document.addEventListener('pointerdown', (e) => {
    if (isOpen() && !inCard(e.target) && !shown?.contains(e.target as Node)) hide();
  });
  // The card stays next to its link only while nothing moves.
  addEventListener('scroll', (e) => !inCard(e.target) && hide(), { capture: true, passive: true });
  addEventListener('resize', hide);
  addEventListener('pagehide', hide);
}
