import { type Hold, hold } from './skeleton';

// In the browser: a link or GET form with data-pending="<selector>" opens another page; until it
// arrives, the selector's regions show skeletons and the link turns current. Back from the cache
// undoes both. The listeners are added on first import.

type Undo = () => void;
const undos: Undo[] = [];

/** Skeletons in the regions, and the link current among its group; returns how to put it back. */
export function pending(selector: string, link?: HTMLElement): Undo {
  const steps: Undo[] = [];
  const group = link?.closest('nav, [role="tablist"], [data-pending-group]');
  if (link && group) {
    const before = [...group.querySelectorAll<HTMLElement>('[aria-current]')].map((el) => [el, el.getAttribute('aria-current')!] as const);
    before.forEach(([el]) => el.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'true');
    steps.push(() => {
      link.removeAttribute('aria-current');
      before.forEach(([el, v]) => el.setAttribute('aria-current', v));
    });
  }
  for (const region of document.querySelectorAll<HTMLElement>(selector)) {
    // The region keeps its height, so the page under it does not jump.
    const height = region.style.minHeight;
    region.style.minHeight = `${region.offsetHeight}px`;
    const h: Hold = hold(region);
    steps.push(() => {
      h.undo();
      region.style.minHeight = height;
    });
  }
  const undo = () => steps.splice(0).forEach((s) => s());
  undos.push(undo);
  return undo;
}

// A click on another page, in this tab, that no other handler took.
const leaves = (a: HTMLAnchorElement, e: MouseEvent) =>
  !e.defaultPrevented &&
  e.button === 0 &&
  !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) &&
  (!a.target || a.target === '_self') &&
  !a.hasAttribute('download') &&
  a.origin === location.origin &&
  !(a.hash && a.pathname + a.search === location.pathname + location.search);

if (!(window as { snPending?: boolean }).snPending) {
  (window as { snPending?: boolean }).snPending = true;
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-pending]');
    // Handlers after this one may still take the click, so look once they have run.
    if (a) setTimeout(() => leaves(a, e) && pending(a.dataset.pending!, a));
  });
  document.addEventListener('submit', (e) => {
    const f = e.target as HTMLFormElement;
    if (f.matches('form[data-pending]')) setTimeout(() => !e.defaultPrevented && pending(f.dataset.pending!));
  });
  addEventListener('pageshow', (e) => {
    if (e.persisted) undos.splice(0).forEach((u) => u());
  });
}
