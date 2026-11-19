// The scripted micro-interactions, imported by Layout.astro on every page:
// the save heart, figures counting up, share on a listing and the pending
// state of forms (lib/busy).
// src/styles/motion.css holds the rest, the parts CSS does without a script.
import { animate, inView } from 'motion';
import { SPRING, reducedMotion } from '../lib/motion';
import { isId } from '../lib/listing';
import { API, R } from '../lib/routes';
import { toggleRemote } from '../lib/toggle';
import { snack } from '../lib/snackbar';
import { watchSubmits } from '../lib/busy';

watchSubmits();

// iOS Safari shows :active on touch only when the page listens for touchstart;
// motion.css draws every press with it.
document.addEventListener('touchstart', () => {}, { passive: true });

// Save: the heart fills and pops with a ring, /api/saved/<id> saves on the server,
// and the snackbar offers the list or the undo. A guest goes to Đăng nhập;
// a failed call puts the heart back.
function setSave(b: HTMLButtonElement, on: boolean, pop = true) {
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? 'Bỏ lưu tin' : 'Lưu tin');
  if (on && pop && !reducedMotion()) {
    b.classList.remove('is-popping');
    void b.offsetWidth;
    b.classList.add('is-popping');
  }
}
async function save(b: HTMLButtonElement) {
  const on = b.getAttribute('aria-pressed') !== 'true';
  setSave(b, on);
  // A card with no real listing behind it (a preview) only changes on the page.
  if (!isId(b.dataset.save ?? '')) return;
  if (!(await toggleRemote(API.saved(b.dataset.save!), on))) {
    setSave(b, !on, false);
    snack({ text: 'Chưa lưu được tin. Thử lại sau.', icon: 'error-outline-rounded', error: true });
    return;
  }
  snack(
    on
      ? { text: 'Đã lưu tin', icon: 'favorite-rounded', action: { label: 'Xem', href: R.saved } }
      : { text: 'Đã bỏ lưu tin', icon: 'heart-broken-outline-rounded', action: { label: 'Hoàn tác', run: () => save(b) } },
  );
}
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-save]');
  if (!b) return;
  e.preventDefault();
  void save(b);
});
document.addEventListener('animationend', (e) => {
  if ((e as AnimationEvent).animationName === 'save-ring') (e.target as Element).classList.remove('is-popping');
});

// Big figures marked data-count count up from 0 the first time they come
// into view. Only whole numbers from 10 up: "01" in a table of contents stays.
const vi = new Intl.NumberFormat('vi-VN');
document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
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
