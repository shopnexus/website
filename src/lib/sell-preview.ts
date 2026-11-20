import { mountGallery } from './gallery';
import { failure, hold } from './skeleton';

// In the browser: Đăng tin's Xem trước (SellPreview.astro). It sends the form
// as it stands, with each photo's preview URL, to /sell/preview and shows the
// card and the listing page's top that come back. A note's "Sửa", or "Sửa" at
// the foot, closes it on the field to fix; "Đăng tin" posts.

const SRC = '/sell/preview';

/** Where each field the notes name takes the focus back to. */
const FIELDS: Record<string, string> = {
  title: '[data-title]',
  photos: '[data-photo-input]',
  price: '[data-price]',
  condition: '[data-condition]',
  commune: '[data-commune]',
};

export function mountSellPreview(form: HTMLFormElement, post: () => void) {
  const panel = document.querySelector<HTMLDialogElement>('[data-sell-preview]');
  if (!panel) return null;
  const slot = panel.querySelector<HTMLElement>('[data-preview-slot]')!;
  let run = 0;

  async function load() {
    const mine = ++run;
    const body = new FormData(form);
    // Each photo's preview, in the form's order; "" for one with none.
    form.querySelectorAll('[data-photo]').forEach((li) => {
      const img = li.querySelector('img');
      body.append('photo_url', img?.currentSrc || img?.src || '');
    });
    slot.scrollTop = 0;
    const h = hold(slot, { kind: 'listing', n: 1 });
    try {
      const res = await fetch(SRC, { method: 'POST', body, headers: { accept: 'text/html' } });
      if (!res.ok) throw new Error(String(res.status));
      const t = document.createElement('template');
      t.innerHTML = await res.text();
      await h.end();
      if (mine !== run) return;
      const view = t.content.querySelector<HTMLElement>('[data-preview-body]');
      if (!view) throw new Error('empty');
      slot.replaceChildren(view);
      view.querySelectorAll<HTMLElement>('[data-gallery]').forEach(mountGallery);
      // A title past the card's two lines is cut there.
      const title = view.querySelector('article h3');
      if (title && title.scrollHeight > title.clientHeight + 1) view.querySelector<HTMLElement>('[data-note="title-cut"]')!.hidden = false;
    } catch {
      await h.end();
      if (mine === run) slot.replaceChildren(failure(load));
    }
  }

  /** Closes on the field to fix: the one named, else the first note's, else where the seller was. */
  function edit(field?: string) {
    const name = field ?? slot.querySelector<HTMLElement>('[data-note]:not([hidden]) [data-edit-field]')?.dataset.editField;
    panel!.close();
    const el = name ? form.querySelector<HTMLElement>(FIELDS[name]) : null;
    if (!el) return;
    el.closest('section')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    el.focus({ preventScroll: true });
  }

  panel.querySelector('[data-preview-close]')!.addEventListener('click', () => panel.close());
  panel.querySelector('[data-preview-edit]')!.addEventListener('click', () => edit());
  panel.querySelector('[data-preview-post]')!.addEventListener('click', () => {
    panel.close();
    post();
  });
  slot.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-edit-field]');
    if (b) edit(b.dataset.editField);
  });
  // A tap on the backdrop closes it.
  panel.addEventListener('click', (e) => {
    if (e.target === panel) panel.close();
  });

  return function open() {
    panel.showModal();
    panel.focus();
    load();
  };
}
