// In the browser: a tap still on this page after 100 ms covers it, under the
// header, with a skeleton of the next page (PageSkeletons.astro) until it comes.

import { leaves } from './leaves';

export type PageKind = 'listing' | 'search';

let shown: HTMLElement | null = null;
let timer = 0;

export function dropSkeleton() {
  clearTimeout(timer);
  shown?.remove();
  shown = null;
}

/** After 100 ms on this page, the `kind` skeleton. `fill` dresses it; `put` adds it, by default at once. */
export function skeletonSoon(kind: PageKind, fill?: (el: HTMLElement) => void, put = (add: () => void, _el: HTMLElement) => add()) {
  clearTimeout(timer);
  timer = window.setTimeout(() => {
    const tpl = document.querySelector<HTMLTemplateElement>(`template[data-page-skeleton="${kind}"]`);
    if (!tpl || shown) return;
    const el = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    el.style.top = `${document.querySelector<HTMLElement>('header.glass')?.offsetHeight ?? 0}px`;
    fill?.(el);
    put(() => {
      document.body.append(el);
      shown = el;
    }, el);
  }, 100);
}

/** The card's photo grows into the gallery frame; Layout.astro pairs it with the listing page's. */
function listing(a: HTMLAnchorElement) {
  const img = a.querySelector('img') ?? a.closest('article, li')?.querySelector('img');
  const photoOf = (el: HTMLElement) => el.querySelector<HTMLImageElement>('[data-skeleton-photo]')!;
  skeletonSoon(
    'listing',
    (el) => {
      if (img?.currentSrc) photoOf(el).src = img.currentSrc;
      else photoOf(el).classList.add('skeleton');
    },
    (add, el) => {
      const swap = () => {
        if (img) img.style.viewTransitionName = '';
        if (img?.currentSrc) photoOf(el).style.viewTransitionName = 'listing-photo';
        add();
      };
      if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return swap();
      if (img?.currentSrc) img.style.viewTransitionName = 'listing-photo';
      document.startViewTransition(swap);
    },
  );
}

addEventListener('click', (e) => {
  const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
  if (a && leaves(a, e) && a.pathname.startsWith('/listings/') && a.pathname !== location.pathname) listing(a);
});
addEventListener('pageshow', dropSkeleton);
addEventListener('keydown', (e) => e.key === 'Escape' && dropSkeleton());
// The next page is coming in: too late for a skeleton.
addEventListener('pageswap', () => clearTimeout(timer));
