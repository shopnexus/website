// snack() shows the app's snackbar at the bottom of the window. One at a time:
// a new one replaces the one on screen. It springs up, and the ring round its
// icon empties over the time it stays.
import { animate } from 'motion';
import { SPRING, reducedMotion } from './motion';

export interface Snack {
  text: string;
  /** A name Snackbar.astro lists; a failure's own icon by default. */
  icon?: string;
  /** A failure turns the icon and the ring `error`. */
  error?: boolean;
  action?: { label: string; href?: string; run?: () => void };
  ms?: number;
}

let current: HTMLElement | null = null;
let timer = 0;

function leave(el: HTMLElement) {
  if (current === el) current = null;
  animate(el, { opacity: 0, y: 12, scale: 0.98 }, reducedMotion() ? { duration: 0 } : SPRING.effects).then(() => el.remove());
}

export function snack({ text, error = false, icon = error ? 'error-outline-rounded' : 'check-rounded', action, ms = 4000 }: Snack) {
  const region = document.querySelector<HTMLElement>('[data-snackbar]');
  if (!region) return;
  if (current) leave(current);
  clearTimeout(timer);

  const el = document.createElement('div');
  el.className =
    'pointer-events-auto flex min-h-12 w-full max-w-[420px] items-center gap-3 rounded-lg bg-secondary-container py-2 pl-2 pr-3 text-on-secondary-container shadow-float';
  el.setAttribute('role', 'status');

  const tone = error ? 'text-error' : 'text-primary';
  const badge = document.createElement('span');
  badge.className = `relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card ${tone}`;
  const svg = document.querySelector<HTMLTemplateElement>(`template[data-snack-icon="${icon}"]`);
  if (svg) badge.append(svg.content.cloneNode(true));
  badge.insertAdjacentHTML(
    'beforeend',
    `<svg viewBox="0 0 32 32" class="absolute inset-0 -rotate-90" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" pathLength="100" stroke-dasharray="100" data-left></circle></svg>`,
  );

  const label = document.createElement('p');
  label.className = 'min-w-0 flex-1 text-body-medium';
  label.textContent = text;
  el.append(badge, label);

  if (action) {
    const a = document.createElement(action.href ? 'a' : 'button');
    a.className = 'state-layer -my-1 flex h-9 shrink-0 items-center rounded-full px-3 text-label-large text-primary';
    a.textContent = action.label;
    if (a instanceof HTMLAnchorElement) a.href = action.href!;
    else (a as HTMLButtonElement).type = 'button';
    a.addEventListener('click', () => {
      action.run?.();
      leave(el);
    });
    el.append(a);
  }

  region.append(el);
  current = el;
  if (!reducedMotion()) animate(el, { opacity: [0, 1], y: [24, 0], scale: [0.96, 1] }, SPRING.spatial);
  const ring = el.querySelector<SVGCircleElement>('[data-left]')!;
  const drain = animate(ring, { strokeDashoffset: [0, 100] }, { duration: ms / 1000, ease: 'linear' });

  // Hovering or focusing keeps it up; leaving starts the time again.
  let left = ms;
  let since = Date.now();
  const start = () => {
    since = Date.now();
    drain.play();
    timer = window.setTimeout(() => leave(el), left);
  };
  const hold = () => {
    clearTimeout(timer);
    drain.pause();
    left = Math.max(0, left - (Date.now() - since));
  };
  el.addEventListener('pointerenter', hold);
  el.addEventListener('pointerleave', start);
  el.addEventListener('focusin', hold);
  el.addEventListener('focusout', start);
  start();
}
