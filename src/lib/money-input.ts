import { group, parseMoney } from './format';

// In the browser: every money field (input[data-money]) groups its thousands
// as it is typed. The caret stays after the same digit, a delete next to a dot
// takes the digit beyond it, and a paste keeps only its digits.

const MAX_DIGITS = 13;
// Enter (insertLineBreak) is left alone, so it still submits the form.
const INSERTS = new Set(['insertText', 'insertReplacementText', 'insertFromPaste', 'insertFromDrop', 'insertFromYank']);
const isDigit = (c: string) => c >= '0' && c <= '9';
const digitsBefore = (s: string, at: number) => [...s.slice(0, at)].filter(isDigit).length;

/** Writes `digits` grouped into the field with the caret after its `caret`-th digit. */
function write(el: HTMLInputElement, digits: string, caret: number) {
  const kept = digits.replace(/^0+/, '');
  caret = Math.max(0, caret - (digits.length - kept.length));
  const text = kept ? group(Number(kept)) : '';
  let at = 0;
  for (let seen = 0; at < text.length && seen < caret; at++) if (isDigit(text[at])) seen++;
  el.value = text;
  if (document.activeElement === el) el.setSelectionRange(at, at);
}

/** The field's digits with [from, to) of its text replaced by `insert`, and the caret's digit after it. */
function edit(el: HTMLInputElement, from: number, to: number, insert: string) {
  const v = el.value;
  const digits = (v.slice(0, from) + insert + v.slice(to)).replace(/\D/g, '');
  return { digits, caret: digitsBefore(v, from) + insert.length };
}

/** The range a delete takes: the selection, or the digit beside a collapsed caret, dots skipped. */
function deleted(el: HTMLInputElement, type: string): [number, number] {
  const v = el.value;
  const s = el.selectionStart ?? v.length;
  const e = el.selectionEnd ?? s;
  if (s !== e) return [s, e];
  if (type === 'deleteWordBackward' || type === 'deleteSoftLineBackward' || type === 'deleteHardLineBackward') return [0, s];
  if (type === 'deleteWordForward' || type === 'deleteSoftLineForward' || type === 'deleteHardLineForward') return [s, v.length];
  if (type.endsWith('Backward')) {
    let i = s - 1;
    while (i >= 0 && !isDigit(v[i])) i--;
    return i < 0 ? [s, s] : [i, i + 1];
  }
  let i = s;
  while (i < v.length && !isDigit(v[i])) i++;
  return i >= v.length ? [s, s] : [i, i + 1];
}

/** Sets a money field to `vnd`, grouped, and tells its listeners. */
export function setMoney(el: HTMLInputElement, vnd: number | null) {
  el.value = vnd ? group(vnd) : '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/** A money field's amount, null when empty. */
export const moneyOf = (el: HTMLInputElement) => parseMoney(el.value);

const field = (t: EventTarget | null) => (t instanceof HTMLInputElement && t.matches('[data-money]') ? t : null);

if (!(window as { snMoney?: boolean }).snMoney) {
  (window as { snMoney?: boolean }).snMoney = true;
  // Typing, pasting and deleting are done here, so the browser never shows the ungrouped text.
  document.addEventListener('beforeinput', (e) => {
    const el = field(e.target);
    if (!el || e.isComposing) return;
    const type = e.inputType;
    let next: { digits: string; caret: number };
    if (INSERTS.has(type)) {
      const text = e.data ?? e.dataTransfer?.getData('text/plain') ?? '';
      const s = el.selectionStart ?? el.value.length;
      next = edit(el, s, el.selectionEnd ?? s, text.replace(/\D/g, ''));
    } else if (type.startsWith('delete')) {
      next = edit(el, ...deleted(el, type), '');
    } else return;
    e.preventDefault();
    if (next.digits.replace(/^0+/, '').length > MAX_DIGITS) return;
    write(el, next.digits, next.caret);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  // Whatever got past beforeinput (an IME, autofill, undo) is grouped once it lands.
  document.addEventListener('input', (e) => {
    const el = field(e.target);
    if (!el) return;
    const at = el.selectionStart ?? el.value.length;
    const digits = el.value.replace(/\D/g, '').slice(0, MAX_DIGITS);
    if (el.value !== (digits.replace(/^0+/, '') ? group(Number(digits)) : '')) write(el, digits, digitsBefore(el.value, at));
  });
  // A form sends the plain amount, so addresses read ?min=500000, not 500.000.
  document.addEventListener(
    'formdata',
    (e) => {
      (e.target as HTMLFormElement).querySelectorAll<HTMLInputElement>('input[data-money][name]').forEach((el) => {
        if (!el.disabled) e.formData.set(el.name, String(moneyOf(el) ?? ''));
      });
    },
    { capture: true },
  );
}
