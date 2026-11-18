// The scripted micro-interactions, imported by Layout.astro on every page:
// the save heart, figures counting up, share on a listing and the gallery
// swap. src/styles/motion.css holds the rest, the parts CSS does without a script.
import { animate, inView } from 'motion';
import { SPRING, reducedMotion } from '../lib/motion';
import { R } from '../lib/routes';
import { snack } from '../lib/snackbar';

// Save: the heart fills and pops with a ring, and the snackbar offers the list
// or the undo.
function toggleSave(b: HTMLButtonElement, pop = true) {
  const on = b.getAttribute('aria-pressed') !== 'true';
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? 'Bỏ lưu tin' : 'Lưu tin');
  if (on && pop && !reducedMotion()) {
    b.classList.remove('is-popping');
    void b.offsetWidth;
    b.classList.add('is-popping');
  }
  return on;
}
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-save]');
  if (!b) return;
  e.preventDefault();
  const on = toggleSave(b);
  snack(
    on
      ? { text: 'Đã lưu tin', icon: 'favorite-rounded', action: { label: 'Xem', href: R.saved } }
      : { text: 'Đã bỏ lưu tin', icon: 'heart-broken-outline-rounded', action: { label: 'Hoàn tác', run: () => toggleSave(b) } },
  );
});
document.addEventListener('animationend', (e) => {
  if ((e as AnimationEvent).animationName === 'save-ring') (e.target as Element).classList.remove('is-popping');
});

// Big figures in the teal gradient count up from 0 the first time they come
// into view. Only whole numbers from 10 up: "01" in a table of contents stays.
const vi = new Intl.NumberFormat('vi-VN');
document.querySelectorAll<HTMLElement>('.grad-num').forEach((el) => {
  const text = el.textContent?.trim() ?? '';
  if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(text)) return;
  const value = Number(text.replaceAll('.', ''));
  if (value < 10 || reducedMotion()) return;
  // Keep the width of the final figure so the line does not jump.
  el.style.minWidth = `${el.getBoundingClientRect().width}px`;
  el.style.display = 'inline-block';
  el.textContent = '0';
  inView(
    el,
    () => {
      animate(0, value, { ...SPRING.count, onUpdate: (v) => (el.textContent = vi.format(Math.round(v))) });
    },
    { amount: 0.6 },
  );
});

// Share on a listing: the system sheet on a phone, a copied link elsewhere.
document.addEventListener('click', async (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-share]');
  if (!b) return;
  const url = location.href.split('#')[0];
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    navigator.share({ title: document.title, url }).catch(() => {});
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    snack({ text: 'Đã sao chép link', icon: 'link-rounded' });
  } catch {
    snack({ text: 'Không sao chép được link', icon: 'error-outline-rounded', error: true });
  }
});

// A gallery thumbnail swaps the big photo once the new one has decoded, and
// the photo settles in from a slight zoom.
document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((g) => {
  const big = g.querySelector<HTMLImageElement>('[data-main]');
  if (!big) return;
  g.addEventListener('click', async (e) => {
    const t = (e.target as Element).closest<HTMLButtonElement>('[data-big]');
    if (!t || t.getAttribute('aria-pressed') === 'true') return;
    g.querySelectorAll('[data-big]').forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
    const next = new Image();
    next.src = t.dataset.big!;
    await next.decode().catch(() => {});
    big.removeAttribute('srcset');
    big.src = next.src;
    if (!reducedMotion()) animate(big, { opacity: [0.35, 1], scale: [1.03, 1] }, SPRING.spatialSlow);
  });
});
