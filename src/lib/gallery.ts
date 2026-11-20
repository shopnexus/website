import { arrowKeys, openViewer, slideAt, slideTo, viewerAt } from './photo-viewer';

// In the browser: a Gallery.astro frame, a row of slides the width of its
// frame each, with the full-window viewer of PhotoViewer.astro.

/** Wires a [data-gallery]: arrows, counter, dots, thumbnails, keys and the viewer. */
export function mountGallery(g: HTMLElement) {
  const track = g.querySelector<HTMLElement>('[data-slides]')!;
  const n = track.children.length;
  const prev = g.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = g.querySelector<HTMLButtonElement>('[data-next]')!;
  const label = g.querySelector<HTMLElement>('[data-at]')!;
  const thumbs = [...g.querySelectorAll<HTMLButtonElement>('[data-thumb]')];
  const dots = [...g.querySelectorAll<HTMLElement>('[data-dot-i]')];
  const viewer = g.querySelector<HTMLDialogElement>('[data-viewer]')!;

  let shown = -1;
  const sync = () => {
    const i = slideAt(track);
    if (i === shown) return;
    shown = i;
    prev.disabled = i === 0;
    next.disabled = i === n - 1;
    label.textContent = `${i + 1}/${n}`;
    thumbs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
    dots.forEach((d, k) => d.toggleAttribute('data-on', k === i));
  };
  track.addEventListener('scroll', sync, { passive: true });
  new ResizeObserver(() => {
    slideTo(track, shown, true);
  }).observe(track);
  prev.addEventListener('click', () => slideTo(track, slideAt(track) - 1));
  next.addEventListener('click', () => slideTo(track, slideAt(track) + 1));
  thumbs.forEach((t, k) => t.addEventListener('click', () => slideTo(track, k)));
  arrowKeys(track, track);
  sync();

  // The viewer opens on the photo in the frame and hands its photo back on close.
  g.querySelector('[data-open-viewer]')!.addEventListener('click', () => openViewer(viewer, slideAt(track)));
  viewer.addEventListener('close', () => slideTo(track, viewerAt(viewer), true));
}
