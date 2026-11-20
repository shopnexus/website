// In the browser: a mouse across a result's photo box ([data-scrub], its
// photos' URLs) shows one photo per vertical strip, with a bar of segments at
// the bottom; leaving the result shows the cover again. From 840 px with a
// fine pointer; keyboard focus never scrubs.

interface Scrub {
  urls: string[];
  img: HTMLImageElement;
  cover: string;
  bar: HTMLElement;
}

const scrubMouse = matchMedia('(min-width: 840px) and (hover: hover) and (pointer: fine)');
const scrubs = new WeakMap<HTMLElement, Scrub>();

/** The box's scrub, made on its first hover: the other photos start loading then. */
function scrubOf(box: HTMLElement): Scrub | null {
  const known = scrubs.get(box);
  if (known) return known;
  const img = box.querySelector('img');
  if (!img) return null;
  const urls = box.dataset.scrub!.split(' ');
  urls.slice(1).forEach((u) => (new Image().src = u));
  // A copy of the page kept for Back (lib/keep) may hold the bar already.
  let bar = box.querySelector<HTMLElement>('[data-scrub-bar]');
  if (!bar) {
    bar = document.createElement('div');
    bar.className =
      'pointer-events-none absolute inset-x-0 bottom-0 flex h-4 items-end gap-1 bg-linear-to-t from-black/35 px-2 pb-1 opacity-0 transition-opacity duration-(--duration-effects-fast) data-[shown]:opacity-100';
    bar.dataset.scrubBar = '';
    bar.ariaHidden = 'true';
    bar.append(...urls.map(() => Object.assign(document.createElement('span'), { className: 'h-0.5 flex-1 rounded-full bg-white/45 data-[on]:bg-white' })));
    box.append(bar);
  }
  const s = { urls, img, cover: img.getAttribute('src')!, bar };
  scrubs.set(box, s);
  return s;
}

function scrubTo(s: Scrub, i: number) {
  const url = i === 0 ? s.cover : s.urls[i];
  if (s.img.getAttribute('src') !== url) s.img.src = url;
  s.bar.toggleAttribute('data-shown', true);
  [...s.bar.children].forEach((seg, j) => seg.toggleAttribute('data-on', j === i));
}

function scrubBack(box: HTMLElement) {
  const s = scrubs.get(box);
  if (!s) return;
  if (s.img.getAttribute('src') !== s.cover) s.img.src = s.cover;
  s.bar.removeAttribute('data-shown');
}

const scrubBoxIn = (card: Element | null | undefined) => card?.querySelector<HTMLElement>('[data-scrub]');

// The card's title link covers the photo, so the box is found through its card.
document.addEventListener(
  'pointermove',
  (e) => {
    if (e.pointerType !== 'mouse' || !scrubMouse.matches) return;
    const box = scrubBoxIn((e.target as Element).closest('article'));
    const r = box?.getBoundingClientRect();
    if (!box || !r || e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom) return;
    const s = scrubOf(box);
    if (s) scrubTo(s, Math.floor(((e.clientX - r.left) / r.width) * s.urls.length));
  },
  { passive: true },
);
document.addEventListener('pointerout', (e) => {
  const card = (e.target as Element).closest('article');
  const box = scrubBoxIn(card);
  if (box && !card!.contains(e.relatedTarget as Node | null)) scrubBack(box);
});
// Before lib/keep copies the page: the cover comes back with Back.
addEventListener('pagehide', () => document.querySelectorAll<HTMLElement>('[data-scrub]').forEach(scrubBack), { capture: true });
