// In the browser: the code boxes of CodeBoxes.astro. A digit moves to the
// next box, Backspace to the one before, a pasted code fills them all, and
// the sixth digit submits the boxes' form with its [data-code-submit] button.
// A code completed while a step runs waits for it (stepper in lib/proof-form.ts).
export function codeBoxes() {
  document.querySelectorAll<HTMLFieldSetElement>('[data-code-boxes]').forEach((set) => {
    const boxes = [...set.querySelectorAll<HTMLInputElement>('[data-digit]')];
    const full = () => boxes.every((b) => /^\d$/.test(b.value));
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => {
        const digits = b.value.replace(/\D/g, '');
        if (digits.length > 1) {
          digits.split('').slice(0, boxes.length - i).forEach((d, k) => (boxes[i + k].value = d));
        } else {
          b.value = digits;
        }
        if (b.value) boxes[Math.min(i + digits.length, boxes.length - 1)].focus();
        // The form's main button submits, so its name and value go with the boxes.
        if (full()) set.form?.requestSubmit(set.form.querySelector<HTMLButtonElement>('[data-code-submit]'));
      });
      b.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !b.value && i > 0) boxes[i - 1].focus();
      });
    });
  });
}

/** The boxes' digits as one string. */
export const codeOf = (set: ParentNode) => [...set.querySelectorAll<HTMLInputElement>('[data-digit]')].map((b) => b.value).join('');

/** Empties the boxes and puts the caret in the first. */
export function clearCode(set: ParentNode) {
  const boxes = [...set.querySelectorAll<HTMLInputElement>('[data-digit]')];
  boxes.forEach((b) => (b.value = ''));
  boxes[0]?.focus();
}
