import { leaves } from './leaves';
import { skeletonSoon } from './page-skeleton';
import { API, R } from './routes';
import { type CategoryOption, matchCategories, matchRecent } from './suggest';

// In the browser: the header's search field. Empty, the dropdown shows recent
// searches and categories; typed, a list to pick from with ↑/↓ and Enter.
// Recent searches are the server's when signed in, this browser's otherwise.

const form = document.querySelector<HTMLFormElement>('[data-search]')!;
const input = form.querySelector<HTMLInputElement>('input[name="q"]')!;
const find = document.getElementById('hdr-find')!;
const idle = find.querySelector<HTMLElement>('[data-find-idle]')!;
const list = find.querySelector<HTMLElement>('[data-find-list]')!;
const cats: CategoryOption[] = JSON.parse(find.querySelector('[data-find-options]')?.textContent || '[]');
const signed = 'signed' in form.dataset;
const KEY = 'sn_recent';

const local = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
};
const keep = (all: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
};
let recent: Promise<string[]> | null = null;
const loadRecent = () =>
  (recent ??= signed
    ? fetch(API.searchHistory)
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((d: { items: { query: string }[] }) => d.items.map((i) => i.query))
        .catch(() => [])
    : Promise.resolve(local()));
/** The server keeps a signed-in buyer's searches itself. */
const remember = (q: string) => {
  if (!signed) keep([q, ...local().filter((x) => x !== q)].slice(0, 6));
};
const forget = () => {
  if (signed) void fetch(API.searchHistory, { method: 'DELETE' });
  else keep([]);
  recent = Promise.resolve([]);
};

const scopeName = () => form.querySelector<HTMLElement>('[data-scope]')?.dataset.scope ?? '';
const searchUrl = (q: string, category?: string) => {
  const u = new URL(form.action);
  if (q) u.searchParams.set('q', q);
  if (category) u.searchParams.set('category', category);
  return u.pathname + u.search;
};
// A subcategory opens its root's page with its pill on.
const categoryUrl = (c: CategoryOption) => (c.parent ? `${R.category(c.root)}?category=${c.code}` : R.category(c.code));
// The search page's own title, so the skeleton reads as it will.
const titleOf = (q: string, scoped: boolean) => (q ? `“${q}”` : scoped ? scopeName() : 'Tin mới đăng');

function dropScope() {
  const chip = form.querySelector('[data-scope]');
  if (!chip) return;
  chip.remove();
  input.placeholder = input.dataset.placeholder ?? '';
  input.focus();
  void render();
}
form.querySelector('[data-scope-clear]')?.addEventListener('click', dropScope);

const clone = (sel: string) => (find.querySelector<HTMLTemplateElement>(sel)!.content.firstElementChild!.cloneNode(true) as HTMLElement);
let seq = 0;

function option(o: { icon: string; text: Node[]; hint?: string; href: string; title: string; q?: string; mint?: boolean }) {
  const a = clone('template[data-option]') as HTMLAnchorElement;
  a.id = `hdr-find-${seq++}`;
  a.href = o.href;
  a.dataset.title = o.title;
  if (o.q) a.dataset.q = o.q;
  const ico = a.querySelector<HTMLElement>('[data-option-icon]')!;
  ico.append(clone(`template[data-icon="${o.icon}"]`));
  if (o.mint) {
    ico.classList.replace('bg-soft', 'bg-mint');
    ico.classList.replace('text-sub', 'text-on-mint');
  }
  a.querySelector('[data-option-text]')!.append(...o.text);
  a.querySelector('[data-option-hint]')!.textContent = o.hint ?? '';
  return a;
}

function group(label: string, rows: HTMLElement[]) {
  const g = document.createElement('div');
  g.setAttribute('role', 'group');
  g.setAttribute('aria-label', label);
  const p = document.createElement('p');
  p.className = 'px-2 pb-1 pt-3 text-body-small text-faint';
  p.setAttribute('aria-hidden', 'true');
  p.textContent = label;
  g.append(p, ...rows);
  return g;
}

const quoted = (q: string) => {
  const b = document.createElement('b');
  b.className = 'font-semibold';
  b.textContent = q;
  return [document.createTextNode('Tìm “'), b, document.createTextNode('”')];
};

const options = () => [...list.querySelectorAll<HTMLElement>('[role="option"]')];
function activate(el: HTMLElement | undefined) {
  for (const o of options()) o.setAttribute('aria-selected', String(o === el));
  if (el) {
    input.setAttribute('aria-activedescendant', el.id);
    el.scrollIntoView({ block: 'nearest' });
  } else input.removeAttribute('aria-activedescendant');
}

/** The dropdown for what the field holds now. */
async function render() {
  const q = input.value.trim();
  const typed = !!q;
  idle.hidden = typed;
  list.hidden = !typed;
  if (!typed) {
    list.replaceChildren();
    activate(undefined);
    return renderIdle();
  }
  const past = await loadRecent();
  if (input.value.trim() !== q) return;
  const code = form.querySelector<HTMLInputElement>('input[name="category"]')?.value;
  const rows: HTMLElement[] = [
    option({ icon: 'find', text: quoted(q), hint: code ? `trong ${scopeName()}` : undefined, href: searchUrl(q, code), title: titleOf(q, !!code), q }),
  ];
  if (code) rows.push(option({ icon: 'find', text: quoted(q), hint: 'mọi danh mục', href: searchUrl(q), title: titleOf(q, false), q }));
  const said = matchRecent(past, q).map((r) =>
    option({ icon: 'recent', text: [document.createTextNode(r)], href: searchUrl(r), title: titleOf(r, false), q: r }),
  );
  const named = matchCategories(cats, q).map((c) =>
    option({ icon: c.root, text: [document.createTextNode(c.name)], hint: c.parent && `trong ${c.parent}`, href: categoryUrl(c), title: c.name, mint: true }),
  );
  list.replaceChildren(...rows, ...(said.length ? [group('Tìm gần đây', said)] : []), ...(named.length ? [group('Danh mục', named)] : []));
  activate(rows[0]);
}

async function renderIdle() {
  const past = await loadRecent();
  const box = idle.querySelector<HTMLElement>('[data-recent]')!;
  box.hidden = past.length === 0;
  box.querySelector('[data-recent-list]')!.replaceChildren(
    ...past.slice(0, 6).map((q) => {
      const a = document.createElement('a');
      a.href = searchUrl(q);
      a.dataset.title = titleOf(q, false);
      a.dataset.q = q;
      a.className = 'state-layer flex h-8 items-center rounded-full bg-soft px-3 text-body-medium text-ink hover:bg-hover';
      a.textContent = q;
      return a;
    }),
  );
}

/** Closes the dropdown at once; if the next page is slow, a skeleton titled `title` holds this one. */
function leave(title?: string, q?: string) {
  find.hidePopover();
  if (q) remember(q);
  if (title) skeletonSoon('search', (el) => (el.querySelector('[data-skeleton-title]')!.textContent = title));
}

find.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (a && leaves(a, e)) leave(a.dataset.title, a.dataset.q);
});
// Sent by script, so the field's icon does not turn into the busy ring (busy.ts).
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = input.value.trim();
  const code = form.querySelector<HTMLInputElement>('input[name="category"]')?.value;
  leave(titleOf(q, !!code), q || undefined);
  location.assign(searchUrl(q, code));
});

const isOpen = () => find.matches(':popover-open');
const open = () => {
  if (isOpen()) return;
  void render();
  find.showPopover();
};
find.addEventListener('toggle', (e) => input.setAttribute('aria-expanded', String((e as ToggleEvent).newState === 'open')));
input.addEventListener('focus', open);
input.addEventListener('click', open);
input.addEventListener('input', () => (isOpen() ? void render() : open()));
input.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') find.hidePopover();
  else if (e.key === 'Backspace' && !input.value) dropScope();
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const all = options();
    if (!all.length) return;
    e.preventDefault();
    open();
    const at = all.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    const step = e.key === 'ArrowDown' ? 1 : -1;
    activate(all[at < 0 ? (step > 0 ? 0 : all.length - 1) : (at + step + all.length) % all.length]);
  } else if (e.key === 'Enter' && !e.isComposing) {
    const on = options().find((o) => o.getAttribute('aria-selected') === 'true');
    // The first row is the search itself: the form sends it.
    if (!on || on === options()[0]) return;
    e.preventDefault();
    on.click();
  }
});
list.addEventListener('pointermove', (e) => {
  const o = (e.target as Element).closest<HTMLElement>('[role="option"]');
  if (o && o.getAttribute('aria-selected') !== 'true') activate(o);
});
find.querySelector('[data-recent-clear]')!.addEventListener('click', () => {
  forget();
  void renderIdle();
  input.focus();
});

// "/" outside a field goes to the search.
addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (e.key !== '/' || t.closest('input, textarea, select, [contenteditable]')) return;
  e.preventDefault();
  input.focus();
});
