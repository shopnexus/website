import { whileBusy } from './busy';
import { failure, hold } from './skeleton';

// In the browser: a link with data-peek="<panel id>" opens that Peek panel
// instead of its page, and the panel loads its partial each time it opens.
// Middle-click, a modifier key, or the link's own page still go to the page.

const panelOf = (a: HTMLAnchorElement) => document.getElementById(a.dataset.peek ?? '');
const linkOf = (pop: HTMLElement) => document.querySelector<HTMLAnchorElement>(`a[data-peek="${pop.id}"]`);
const isOpen = (pop: HTMLElement) => pop.matches(':popover-open');

/** Puts a partial's pieces in place: inside the panel their contents, elsewhere (the header button) the whole element. */
function apply(pop: HTMLElement, html: string) {
  const t = document.createElement('template');
  t.innerHTML = html;
  for (const fresh of t.content.querySelectorAll<HTMLElement>('[data-part]')) {
    const sel = `[data-part="${fresh.dataset.part}"]`;
    const inside = pop.querySelector(sel);
    if (inside) inside.replaceChildren(...fresh.childNodes);
    else document.querySelector(sel)?.replaceWith(fresh);
  }
  linkOf(pop)?.setAttribute('aria-expanded', String(isOpen(pop)));
}

async function load(pop: HTMLElement, init?: RequestInit) {
  const src = pop.querySelector<HTMLElement>('[data-peek-src]')!.dataset.peekSrc!;
  const body = pop.querySelector<HTMLElement>(`[data-part="${pop.id}-body"]`)!;
  const h = hold(body, { kind: 'line', n: 4 });
  try {
    const res = await fetch(src, { ...init, headers: { accept: 'text/html' } });
    // Signed out meanwhile: the page takes them to Đăng nhập.
    if (res.redirected) return void (location.href = linkOf(pop)?.href ?? '/');
    if (!res.ok) throw new Error(String(res.status));
    const html = await res.text();
    await h.end();
    apply(pop, html);
    return true;
  } catch {
    h.undo();
    body.replaceChildren(failure(() => load(pop)));
    return false;
  }
}

if (!(window as { snPeek?: boolean }).snPeek) {
  (window as { snPeek?: boolean }).snPeek = true;
  // A press on the link of an open panel light-dismisses it before the click; remember it was open.
  let wasOpen: HTMLElement | null = null;
  document.addEventListener(
    'pointerdown',
    (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-peek]');
      const pop = a && panelOf(a);
      wasOpen = pop && isOpen(pop) ? pop : null;
    },
    true,
  );
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-peek]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const pop = panelOf(a);
    if (!pop || a.pathname === location.pathname) return;
    e.preventDefault();
    const was = wasOpen === pop || isOpen(pop);
    wasOpen = null;
    if (was) {
      if (isOpen(pop)) pop.hidePopover();
      return;
    }
    pop.showPopover();
    load(pop);
  });

  for (const pop of document.querySelectorAll<HTMLElement>('.pop:has([data-peek-src])')) {
    pop.addEventListener('toggle', (e) => {
      const open = (e as ToggleEvent).newState === 'open';
      const a = linkOf(pop);
      a?.setAttribute('aria-expanded', String(open));
      if (open) pop.querySelector<HTMLElement>('[data-peek-title]')?.focus({ preventScroll: true });
      // Closed from inside (Esc, or a press that left focus nowhere): focus goes back to the button.
      else if (a && (pop.contains(document.activeElement) || document.activeElement === document.body)) a.focus();
    });
    // "Đánh dấu đã đọc" and the like post to the partial, which answers with its fresh pieces.
    pop.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      if (!form.matches('[data-peek-form]')) return;
      e.preventDefault();
      const by = (e as SubmitEvent).submitter ?? form;
      const data = new FormData(form, (e as SubmitEvent).submitter);
      whileBusy(by, () => load(pop, { method: 'post', body: data }));
    });
  }
}
