import { hold } from './skeleton';
import { snack } from './snackbar';

// In the browser: "Xem thêm" (a[data-more="<selector>"]) appends the next page's items to the
// selector's regions and takes that page's link; without script it opens the page. Groups with
// the same data-more-key join, and data-more-skip items stay on the first page only.

/** Moves a page's items into a region; a first group with the last one's key joins it. */
function append(region: HTMLElement, items: HTMLElement[]) {
  const last = region.lastElementChild as HTMLElement | null;
  const first = items[0];
  if (last?.dataset.moreKey && first?.dataset.moreKey === last.dataset.moreKey) {
    last.querySelector('[data-more-items]')?.append(...(first.querySelector('[data-more-items]')?.children ?? []));
    items.shift();
  }
  items.forEach((it) => it.setAttribute('data-fresh', ''));
  region.append(...items);
}

if (!(window as { snMore?: boolean }).snMore) {
  (window as { snMore?: boolean }).snMore = true;
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
      const next = doc.querySelector<HTMLAnchorElement>(`a[data-more="${CSS.escape(sel)}"]`)?.getAttribute('href');
      if (next) {
        a.href = new URL(next, res.url).href;
        a.removeAttribute('aria-disabled');
      } else {
        const wrap = a.parentElement;
        a.remove();
        if (wrap && !wrap.childElementCount) wrap.remove();
      }
    } catch {
      h.undo();
      a.removeAttribute('aria-disabled');
      snack({ text: 'Chưa tải được. Thử lại sau.', icon: 'error-outline-rounded', error: true });
    }
  });
}
