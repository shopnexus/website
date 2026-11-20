// In the browser: what a page added to itself after it loaded ("Xem thêm",
// a feed tab) comes back with Back or a reload when the page cache did not
// keep the page. Each history entry gets a key in history.state; its parts
// and scroll live in sessionStorage under that key. The page scrolls itself
// back once the parts are in, so history.scrollRestoration is manual.

interface Entry {
  y: number;
  parts: Record<string, unknown>;
}

const PREFIX = 'sn:keep:';
const INDEX = 'sn:keep';
/** History entries kept; the oldest goes first. */
const MAX = 12;

const savers = new Map<string, () => unknown>();
let saved: Entry | null = null;
let started = false;

function entryKey(): string {
  const state = (history.state ?? {}) as { keep?: string };
  if (state.keep) return state.keep;
  const key = Math.random().toString(36).slice(2, 10);
  history.replaceState({ ...state, keep: key }, '');
  return key;
}

function read(key: string): Entry | null {
  try {
    return JSON.parse(sessionStorage.getItem(PREFIX + key) ?? 'null');
  } catch {
    return null;
  }
}

function write(key: string, entry: Entry) {
  try {
    const index = (JSON.parse(sessionStorage.getItem(INDEX) ?? '[]') as string[]).filter((k) => k !== key);
    index.push(key);
    while (index.length > MAX) sessionStorage.removeItem(PREFIX + index.shift());
    sessionStorage.setItem(INDEX, JSON.stringify(index));
    sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Full or blocked storage: Back shows the page as the server sends it.
  }
}

function save() {
  const parts: Record<string, unknown> = {};
  for (const [name, get] of savers) {
    const v = get();
    if (v !== undefined) parts[name] = v;
  }
  write(entryKey(), { y: scrollY, parts });
}

function start() {
  started = true;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (nav?.type === 'back_forward' || nav?.type === 'reload') saved = read(entryKey());
  history.scrollRestoration = 'manual';
  addEventListener('pagehide', save);
  // Once every part is back: the page's module scripts all run before DOMContentLoaded.
  const scroll = () => saved && scrollTo({ top: saved.y, behavior: 'instant' });
  if (nav && !nav.domContentLoadedEventStart) document.addEventListener('DOMContentLoaded', scroll, { once: true });
  else scroll();
}

/** A region's markup as it stands, without skeletons, error states or the entrance fade. */
export function markup(region: HTMLElement) {
  const copy = region.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[data-skeleton], [data-failed]').forEach((el) => el.remove());
  copy.querySelectorAll('[data-fresh]').forEach((el) => el.removeAttribute('data-fresh'));
  return copy.innerHTML;
}

/** Keeps a part of the page: `get` reads it as the page is left (undefined: nothing to keep), `put` gets it back on return. */
export function keep<T>(name: string, get: () => T | undefined, put: (v: T) => void) {
  if (!started) start();
  savers.set(name, get);
  const v = saved?.parts[name];
  if (v !== undefined) put(v as T);
}
