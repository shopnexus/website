import { animate } from 'motion';
import { whileBusy } from './busy';
import { group } from './format';
import { idempotencyKey } from './key';
import { SPRING, reducedMotion } from './motion';
import { type ListingStep, dropFrom, isListingStep, lessPercent, priceAllowed, stepRefusal } from './my-listings';
import { paintPriceLine } from './price-line';
import { API, R, loginHref } from './routes';
import { parsePrice } from './sell';
import { snack } from './snackbar';

// In the browser: a row of Tin của bạn (MyListingRow) runs its steps in
// place through /api/my-listings/<id>. The row shows the result at once: a
// new price, hidden or on sale again, or it leaves the pane. A refusal puts
// the row back and says why in the snackbar.

type Listing = { price: number; price_drop?: { previous_price: number } };

const DONE: Record<ListingStep, string> = {
  hide: 'Đã ẩn tin',
  unhide: 'Tin đã hiện lại',
  'mark-sold': 'Đã đánh dấu đã bán',
  'unmark-sold': 'Tin đã quay lại Đang bán',
  delete: 'Đã xóa tin',
  price: 'Đã đổi giá',
  relist: 'Đã đăng lại tin',
};

class Refused extends Error {}

/** Runs `step` on listing `id`: the listing after it (null after delete), or Refused with the server's code. */
async function run(id: string, step: ListingStep, extra: { price?: number; key?: string } = {}): Promise<Listing | null> {
  const res = await fetch(API.myListing(id), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ step, ...extra }),
  }).catch(() => null);
  if (res?.status === 401) {
    location.href = loginHref(location.pathname + location.search);
    return new Promise(() => {});
  }
  if (!res?.ok) throw new Refused(res ? ((await res.json().catch(() => ({}))) as { code?: string }).code : undefined);
  return res.status === 204 ? null : res.json();
}

const fail = (e: unknown) => snack({ text: stepRefusal(e instanceof Refused ? e.message : ''), error: true });

/** Takes a row out of the list; the function it answers puts it back. */
function leave(row: HTMLElement) {
  const motion = reducedMotion() ? { duration: 0 } : SPRING.effects;
  const out = animate(row, { opacity: 0, scale: 0.98 }, motion).then(() => (row.hidden = true));
  return async () => {
    await out;
    row.hidden = false;
    animate(row, { opacity: 1, scale: 1 }, motion);
  };
}

/** A step from the row's menu, Đăng lại or a confirm. */
async function step(row: HTMLElement, s: ListingStep, by: HTMLElement | null) {
  const id = row.dataset.row!;
  if (s === 'relist') {
    await whileBusy(by ?? row, async () => {
      try {
        await run(id, s, { key: idempotencyKey() });
        snack({ text: DONE[s], action: { label: 'Xem', href: R.myListings } });
      } catch (e) {
        fail(e);
      }
    });
    return;
  }
  if (s === 'hide' || s === 'unhide') {
    const was = row.dataset.status!;
    row.dataset.status = s === 'hide' ? 'hidden' : 'active';
    try {
      await run(id, s);
      snack({ text: DONE[s] });
    } catch (e) {
      row.dataset.status = was;
      fail(e);
    }
    return;
  }
  // Sold, back on sale or deleted: the row leaves this pane.
  const back = leave(row);
  try {
    await run(id, s);
    row.remove();
    snack({ text: DONE[s] });
    if (!document.querySelector('[data-row]')) location.reload();
  } catch (e) {
    await back();
    fail(e);
  }
}

// ---- Đổi giá (PriceEdit): the preview follows the field, Lưu giá shows the price in the row at once.
// The field groups its digits on blur. lib/money-input.ts (feat/offers-inbox), which groups while
// typing and keeps the caret, takes this field over once it is on main.
const priceOf = (form: HTMLFormElement) => Number(form.dataset.price);
const fieldOf = (form: HTMLFormElement) => form.querySelector<HTMLInputElement>('[data-price-input]')!;

function preview(form: HTMLFormElement) {
  const price = priceOf(form);
  const next = parsePrice(fieldOf(form).value);
  const shown = next ?? price;
  paintPriceLine(form.querySelector('[data-price-preview] [data-price-line]')!, shown, dropFrom(price, shown, 'published' in form.dataset));
  form.querySelectorAll<HTMLButtonElement>('[data-pct]').forEach((b) => b.setAttribute('aria-pressed', String(next === lessPercent(price, Number(b.dataset.pct)))));
  form.querySelector('[data-price-error]')!.textContent = '';
}

async function savePrice(form: HTMLFormElement) {
  const row = form.closest<HTMLElement>('[data-row]')!;
  const next = parsePrice(fieldOf(form).value);
  if (!priceAllowed(next)) {
    form.querySelector('[data-price-error]')!.textContent = stepRefusal('invalid_listing');
    return;
  }
  form.closest<HTMLElement>('[popover]')?.hidePopover();
  const price = priceOf(form);
  if (next === price) return;
  const button = row.querySelector<HTMLElement>('[data-price-button]')!;
  const line = button.querySelector('[data-price-line]')!;
  const before = line.cloneNode(true) as Element;
  paintPriceLine(line, next, dropFrom(price, next, 'published' in form.dataset));
  const key = form.querySelector<HTMLInputElement>('input[name="key"]')!;
  try {
    const l = await whileBusy(button, () => run(row.dataset.row!, 'price', { price: next, key: key.value }));
    if (!l) return;
    paintPriceLine(line, l.price, l.price_drop?.previous_price);
    form.dataset.price = String(l.price);
    key.value = idempotencyKey();
    snack({ text: DONE.price });
  } catch (e) {
    line.replaceWith(before);
    fieldOf(form).value = group(price);
    preview(form);
    fail(e);
  }
}

// Each opening starts from the price as it stands, with the field ready to type.
document.addEventListener(
  'toggle',
  (e) => {
    const form = (e.target as Element).querySelector?.<HTMLFormElement>('[data-price-form]');
    if (!form || (e as ToggleEvent).newState !== 'open') return;
    fieldOf(form).value = group(priceOf(form));
    preview(form);
    fieldOf(form).select();
  },
  true,
);
document.addEventListener('input', (e) => {
  const form = (e.target as Element).closest<HTMLFormElement>('[data-price-form]');
  if (form) preview(form);
});
document.addEventListener(
  'blur',
  (e) => {
    const input = e.target as HTMLInputElement;
    if (!input.matches?.('[data-price-input]')) return;
    const p = parsePrice(input.value);
    if (p !== null) input.value = group(p);
  },
  true,
);
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-pct]');
  const form = b?.closest<HTMLFormElement>('[data-price-form]');
  if (!b || !form) return;
  fieldOf(form).value = group(lessPercent(priceOf(form), Number(b.dataset.pct)));
  preview(form);
});

// Every form in a row (its menu, Đăng lại, a confirm, Đổi giá) runs in place.
document.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement;
  const row = form.closest<HTMLElement>('[data-row]');
  if (!row) return;
  e.preventDefault();
  if (form.matches('[data-price-form]')) return void savePrice(form);
  const by = (e as SubmitEvent).submitter;
  const s = by?.getAttribute('value') ?? '';
  if (!isListingStep(s)) return;
  form.closest<HTMLElement>('[popover]')?.hidePopover();
  row.querySelector('details[open]')?.removeAttribute('open');
  step(row, s, by);
});
