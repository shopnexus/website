// In the browser: one pending state for every action that waits on the
// network. A busy control shows a ring (styles/busy.css) and takes no press;
// a form that loads a page goes once and keeps its button busy until it leaves.

let leaving = false;

/** Marks `el` busy, or frees it. Once a page load has started, nothing is freed. */
export function busy(el: Element | null | undefined, on = true) {
  if (!el) return;
  if (on) el.setAttribute('aria-busy', 'true');
  else if (!leaving) el.removeAttribute('aria-busy');
}

/** Runs `work` with `el` busy. A press while it runs is dropped and resolves to undefined. */
export async function whileBusy<T>(el: Element, work: () => Promise<T>): Promise<T | undefined> {
  if (el.getAttribute('aria-busy') === 'true') return undefined;
  busy(el);
  try {
    return await work();
  } finally {
    busy(el, false);
  }
}

/** Sends `form` as a page load from script, with `el` busy until the next page. */
export function leaveWith(form: HTMLFormElement, el?: Element | null) {
  leaving = true;
  busy(el);
  form.dataset.sent = '';
  form.submit();
}

/**
 * Watches every form on the page, called once by page-motion.ts. A submit no
 * script took over loads a page: its button (or the form, sent without one)
 * turns busy, and a post drops any second submit. A page restored from the
 * back cache is free again.
 */
export function watchSubmits() {
  addEventListener(
    'submit',
    (e) => {
      if ((e.target as HTMLFormElement).hasAttribute('data-sent')) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  // On the way back up, after the page's own listeners.
  addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    const by = (e as SubmitEvent).submitter;
    const target = by?.getAttribute('formtarget') ?? form.target;
    const method = (by?.getAttribute('formmethod') ?? form.method).toLowerCase();
    if (e.defaultPrevented || method === 'dialog' || (target && target !== '_self')) return;
    leaving = true;
    if (method === 'post') form.dataset.sent = '';
    busy(by ?? form);
  });
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    document.querySelectorAll<HTMLElement>('form[data-sent]').forEach((f) => delete f.dataset.sent);
    document.querySelectorAll(':is(button, label, form)[aria-busy="true"]').forEach((el) => el.removeAttribute('aria-busy'));
  });
}
