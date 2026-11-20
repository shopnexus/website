import { glide } from './motion';

// In the browser: a row of photo slides, one frame wide each, and the
// full-window viewer of PhotoViewer.astro built on it. The viewer opens on
// a photo, pages with its arrows and the arrow keys, and closes on Esc or ×.

/** The slide in view. */
export const slideAt = (track: HTMLElement) => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));

/** Moves the row to slide i, gliding unless `instant`. */
export function slideTo(track: HTMLElement, i: number, instant = false) {
  const left = Math.max(0, Math.min(track.children.length - 1, i)) * track.clientWidth;
  if (instant) track.scrollLeft = left;
  else glide(track, left);
}

/** Arrow keys on `el` page `track`. */
export function arrowKeys(el: HTMLElement, track: HTMLElement) {
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    slideTo(track, slideAt(track) + (e.key === 'ArrowRight' ? 1 : -1));
  });
}

const slides = (viewer: HTMLDialogElement) => viewer.querySelector<HTMLElement>('[data-viewer-slides]')!;
/** Each wired viewer's update of its counter and arrows. */
const synced = new WeakMap<HTMLDialogElement, () => void>();

function wire(viewer: HTMLDialogElement) {
  const track = slides(viewer);
  const n = track.children.length;
  const label = viewer.querySelector<HTMLElement>('[data-viewer-at]')!;
  const prev = viewer.querySelector<HTMLButtonElement>('[data-viewer-prev]')!;
  const next = viewer.querySelector<HTMLButtonElement>('[data-viewer-next]')!;
  const sync = () => {
    const i = slideAt(track);
    label.textContent = `${i + 1}/${n}`;
    prev.disabled = i === 0;
    next.disabled = i === n - 1;
  };
  track.addEventListener('scroll', sync, { passive: true });
  prev.addEventListener('click', () => slideTo(track, slideAt(track) - 1));
  next.addEventListener('click', () => slideTo(track, slideAt(track) + 1));
  arrowKeys(viewer, track);
  viewer.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-close]')) viewer.close();
  });
  synced.set(viewer, sync);
  return sync;
}

/** Opens the viewer on photo i. */
export function openViewer(viewer: HTMLDialogElement, i: number) {
  const sync = synced.get(viewer) ?? wire(viewer);
  viewer.showModal();
  const track = slides(viewer);
  track.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
  slideTo(track, i, true);
  sync();
}

/** The photo the viewer shows. */
export const viewerAt = (viewer: HTMLDialogElement) => slideAt(slides(viewer));
