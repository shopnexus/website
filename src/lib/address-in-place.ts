import type { AddressRefusal } from './addresses';
import type { Schemas } from './api/client';
import { whileBusy } from './busy';
import { wireAddressCommunes } from './commune-picker';
import { API } from './routes';
import { snack } from './snackbar';

// In the browser: "Thêm địa chỉ" in an address picker (AddressPick.astro)
// puts the address form in place of the form around the picker. A save goes
// to /api/addresses, then that form comes back from its page with the new
// address picked. Without script the link opens Địa chỉ.

const page = async (url: string) => {
  const res = await fetch(url, { headers: { accept: 'text/html' } }).catch(() => null);
  return res?.ok ? new DOMParser().parseFromString(await res.text(), 'text/html') : null;
};

const withParam = (href: string, key: string, value: string) => {
  const u = new URL(href, location.href);
  u.searchParams.set(key, value);
  return u.pathname + u.search;
};

/** The refusal's sentence over the form and its lines under the fields. */
function showRefusal(form: HTMLFormElement, r: AddressRefusal) {
  const box = form.querySelector<HTMLElement>('[data-address-error]');
  if (box) {
    box.querySelector('[data-notice-text]')!.textContent = r.error;
    box.hidden = false;
  }
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
    const text = r.fields[el.dataset.errorFor!];
    el.textContent = text ?? '';
    el.hidden = !text;
  });
  // The first marked field, or the sentence when none is.
  const marked = form.querySelector('[data-error-for]:not([hidden])')?.parentElement?.querySelector<HTMLElement>('input, select');
  if (marked) marked.focus();
  else box?.scrollIntoView({ block: 'nearest' });
}

async function save(form: HTMLFormElement, host: HTMLFormElement, back: string) {
  const res = await fetch(API.addresses, { method: 'POST', body: new FormData(form) }).catch(() => null);
  if (res?.status !== 201) {
    const refusal: AddressRefusal = res?.status === 422 ? await res.json() : { error: 'Chưa lưu được. Thử lại sau ít phút.', fields: {} };
    return showRefusal(form, refusal);
  }
  const saved: Schemas['Address'] = await res.json();
  const doc = await page(withParam(back, 'address', saved.id));
  const fresh = doc?.querySelector<HTMLFormElement>('form:has([data-address-pick])');
  form.remove();
  host.hidden = false;
  if (!fresh) return snack({ text: 'Chưa tải lại được. Thử lại nhé.', error: true });
  host.replaceWith(document.adoptNode(fresh));
  fresh.querySelector<HTMLInputElement>('input[name="address_id"]:checked')?.focus();
}

async function open(add: HTMLAnchorElement) {
  const host = add.closest('form');
  const back = add.closest<HTMLElement>('[data-address-pick]')?.dataset.back;
  if (!host || !back) return;
  const doc = await whileBusy(add, () => page(withParam(add.href, 'part', '1')));
  if (doc === undefined) return;
  const form = doc?.querySelector<HTMLFormElement>('[data-address-form]');
  if (!form) return snack({ text: 'Chưa mở được. Thử lại nhé.', error: true });
  // The parser read <noscript> as markup; with script it has no place.
  form.querySelectorAll('noscript').forEach((n) => n.remove());
  host.hidden = true;
  host.after(document.adoptNode(form));
  wireAddressCommunes(form);
  form.scrollIntoView({ block: 'nearest' });

  const backBtn = form.querySelector<HTMLButtonElement>('[data-address-back]');
  backBtn?.focus();
  backBtn?.addEventListener('click', () => {
    form.remove();
    host.hidden = false;
    add.focus();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.submitter ?? form.querySelector('button[value="save"]');
    if (btn) whileBusy(btn, () => save(form, host, back));
  });
}

document.addEventListener('click', (e) => {
  const add = (e.target as Element).closest?.<HTMLAnchorElement>('a[data-address-add]');
  if (!add || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  open(add);
});
