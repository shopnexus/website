import { keep, markup } from './keep';
import { hold } from './skeleton';
import { snack } from './snackbar';

// In the browser: "Xem thêm" (a[data-more="<selector>"]) appends the next page's items to the
// selector's regions and takes that page's link; without script it opens the page. Groups with
// the same data-more-key join, data-more-skip items stay on the first page only, and an item
// whose data-more-id the region already holds is left out. The grown regions and the link come
// back with Back (lib/keep).

/** Moves a page's items into a region; a first group with the last one's key joins it. */
function append(region: HTMLElement, items: HTMLElement[]) {
  items = items.filter((it) => !it.dataset.moreId || !region.querySelector(`[data-more-id="${CSS.escape(it.dataset.moreId)}"]`));
  const last = region.lastElementChild as HTMLElement | null;
  const first = items[0];
  if (last?.dataset.moreKey && first?.dataset.moreKey === last.dataset.moreKey) {
    last.querySelector('[data-more-items]')?.append(...(first.querySelector('[data-more-items]')?.children ?? []));
    items.shift();
  }
  items.forEach((it) => it.setAttribute('data-fresh', ''));
  region.append(...items);
}

/** A grown region set as the page is left: each region's items, and the next page (null: none). */
interface Grown {
  sel: string;
  regions: string[];
  next: string | null;
}

const moreLink = (sel: string) => document.querySelector<HTMLAnchorElement>(`a[data-more="${CSS.escape(sel)}"]`);

/** The link went with the last page: it leaves, and its row with it when empty. */
function dropLink(a: HTMLAnchorElement) {
  const wrap = a.parentElement;
  a.remove();
  if (wrap && !wrap.childElementCount) wrap.remove();
}

if (!(window as { snMore?: boolean }).snMore) {
  (window as { snMore?: boolean }).snMore = true;
  // Selectors whose regions grew on this page.
  const grown = new Set<string>();
  keep<Grown[]>(
    'more',
    () =>
      grown.size
        ? [...grown].map((sel) => ({
            sel,
            regions: [...document.querySelectorAll<HTMLElement>(sel)].map(markup),
            next: moreLink(sel)?.href ?? null,
          }))
        : undefined,
    (sets) =>
      sets.forEach(({ sel, regions, next }) => {
        document.querySelectorAll<HTMLElement>(sel).forEach((r, i) => regions[i] !== undefined && (r.innerHTML = regions[i]));
        const a = moreLink(sel);
        if (a && next) a.href = next;
        else if (a) dropLink(a);
        grown.add(sel);
      }),
  );
  document.addEventListener('click', async (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-more]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (a.hasAttribute('aria-disabled')) return;
    const sel = a.dataset.more!;
    const regions = [...document.querySelectorAll<HTMLElement>(sel)];
    const shown = regions.find((r) => r.offsetParent) ?? regions[0];
    if (!shown) return;
    a.setAttribute('aria-disabled', 'true');
    const h = hold(shown, { at: 'append', n: Number(shown.dataset.skeletonCount ?? 4) });
    try {
      const res = await fetch(a.href, { headers: { accept: 'text/html' } });
      // Signed out meanwhile: the page itself takes them to Đăng nhập.
      if (res.redirected) return void (location.href = a.href);
      if (!res.ok) throw new Error(String(res.status));
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      await h.end();
      const fresh = [...doc.querySelectorAll<HTMLElement>(sel)];
      regions.forEach((r, i) => {
        const items = [...(fresh[i]?.children ?? [])].filter((c) => !c.hasAttribute('data-more-skip'));
        append(r, items.map((c) => document.importNode(c, true) as HTMLElement));
      });
      grown.add(sel);
      const next = doc.querySelector<HTMLAnchorElement>(`a[data-more="${CSS.escape(sel)}"]`)?.getAttribute('href');
      if (next) {
        a.href = new URL(next, res.url).href;
        a.removeAttribute('aria-disabled');
      } else dropLink(a);
    } catch {
      h.undo();
      a.removeAttribute('aria-disabled');
      snack({ text: 'Chưa tải được. Thử lại sau.', icon: 'error-outline-rounded', error: true });
    }
  });
}
