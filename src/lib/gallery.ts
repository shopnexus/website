import { glide } from './motion';

// In the browser: a Gallery.astro frame. One row of slides, the width of its
// frame each; `at` is the slide in view.

const at = (track: HTMLElement) => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
const go = (track: HTMLElement, i: number, instant = false) => {
  const left = Math.max(0, Math.min(track.children.length - 1, i)) * track.clientWidth;
  if (instant) track.scrollLeft = left;
  else glide(track, left);
};

/** Wires a [data-gallery]: arrows, counter, dots, thumbnails, keys and the full-window viewer. */
export function mountGallery(g: HTMLElement) {
  const track = g.querySelector<HTMLElement>('[data-slides]')!;
  const n = track.children.length;
  const prev = g.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = g.querySelector<HTMLButtonElement>('[data-next]')!;
  const label = g.querySelector<HTMLElement>('[data-at]')!;
  const thumbs = [...g.querySelectorAll<HTMLButtonElement>('[data-thumb]')];
  const dots = [...g.querySelectorAll<HTMLElement>('[data-dot-i]')];
  const viewer = g.querySelector<HTMLDialogElement>('[data-viewer]')!;
  const vtrack = viewer.querySelector<HTMLElement>('[data-viewer-slides]')!;
  const vlabel = viewer.querySelector<HTMLElement>('[data-viewer-at]')!;

  let shown = -1;
  const sync = () => {
    const i = at(track);
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
    go(track, shown, true);
  }).observe(track);
  prev.addEventListener('click', () => go(track, at(track) - 1));
  next.addEventListener('click', () => go(track, at(track) + 1));
  thumbs.forEach((t, k) => t.addEventListener('click', () => go(track, k)));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      go(track, at(track) + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  sync();

  // The viewer opens on the photo in the frame and hands its photo back on close.
  const vprev = viewer.querySelector<HTMLButtonElement>('[data-viewer-prev]')!;
  const vnext = viewer.querySelector<HTMLButtonElement>('[data-viewer-next]')!;
  const vsync = () => {
    const i = at(vtrack);
    vlabel.textContent = `${i + 1}/${n}`;
    vprev.disabled = i === 0;
    vnext.disabled = i === n - 1;
  };
  vtrack.addEventListener('scroll', vsync, { passive: true });
  g.querySelector('[data-open-viewer]')!.addEventListener('click', () => {
    viewer.showModal();
    vtrack.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
    go(vtrack, at(track), true);
    vsync();
  });
  vprev.addEventListener('click', () => go(vtrack, at(vtrack) - 1));
  vnext.addEventListener('click', () => go(vtrack, at(vtrack) + 1));
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      go(vtrack, at(vtrack) + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewer.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-close]')) viewer.close();
  });
  viewer.addEventListener('close', () => go(track, at(vtrack), true));
}
