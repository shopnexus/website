import { btnCls } from './ui';

// In the browser: skeletons from <Skeleton> templates hold a region's place
// while it loads. They show from 80 ms on and stay at least 350 ms, so a fast
// answer does not flash them.

const DELAY = 80;
const MIN = 350;
const wait = (ms: number) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

/** n copies of a kind's skeleton; none when the page has no template for it. */
export function bones(kind: string, n = 1): HTMLElement[] {
  const one = document.querySelector<HTMLTemplateElement>(`template[data-skeleton-of="${kind}"]`)?.content.firstElementChild;
  return one ? Array.from({ length: n }, () => one.cloneNode(true) as HTMLElement) : [];
}

export interface Hold {
  /** Waits out the skeleton's least time, then takes it away. */
  end(): Promise<void>;
  /** Takes it away now and puts back what it replaced. */
  undo(): void;
}

type At = 'replace' | 'append' | 'prepend';

/**
 * Skeletons in a region; kind and count default to its data-skeleton-kind and data-skeleton-count.
 * delay 0 shows them at once, for a region that opens already waiting.
 */
export function hold(
  region: HTMLElement,
  { kind = region.dataset.skeletonKind ?? 'card', n = Number(region.dataset.skeletonCount ?? 1), at = 'replace' as At, delay = DELAY } = {},
): Hold {
  let shownAt = 0;
  let put: HTMLElement[] = [];
  let kept: Node[] | null = null;
  region.setAttribute('aria-busy', 'true');
  const show = () => {
    shownAt = performance.now();
    put = bones(kind, n);
    if (at === 'replace') {
      // Older skeletons are not worth keeping.
      kept = [...region.childNodes].filter((c) => !(c instanceof HTMLElement && c.hasAttribute('data-skeleton')));
      region.replaceChildren(...put);
    } else region[at](...put);
  };
  const timer = delay > 0 ? setTimeout(show, delay) : (show(), undefined);
  const clear = () => {
    clearTimeout(timer);
    put.forEach((b) => b.remove());
    region.removeAttribute('aria-busy');
  };
  return {
    async end() {
      clearTimeout(timer);
      if (shownAt) await wait(MIN - (performance.now() - shownAt));
      clear();
    },
    undo() {
      clear();
      if (kept) region.replaceChildren(...kept);
      kept = null;
    },
  };
}

/** Values being read again: their old text hides under the shimmer. */
export function stale(els: HTMLElement[]): Pick<Hold, 'end'> {
  let shownAt = 0;
  const timer = setTimeout(() => {
    shownAt = performance.now();
    els.forEach((el) => el.setAttribute('data-stale', ''));
  }, DELAY);
  return {
    async end() {
      clearTimeout(timer);
      if (shownAt) await wait(MIN - (performance.now() - shownAt));
      els.forEach((el) => el.removeAttribute('data-stale'));
    },
  };
}

/** The error state of a region that did not load, with "Thử lại". */
export function failure(retry: () => void): HTMLElement {
  const box = document.createElement('div');
  box.className = 'col-span-full flex flex-col items-center gap-3 py-10 text-center';
  box.dataset.failed = '';
  box.innerHTML = `<p class="text-body-large text-sub">Chưa tải được.</p><button type="button" class="${btnCls('line', 'sm')}">Thử lại</button>`;
  box.querySelector('button')!.addEventListener('click', () => {
    box.remove();
    retry();
  });
  return box;
}
