// In the browser: a seller's quick replies in the composer
// (QuickReplies.astro in Composer's popover). A pick goes into the field at
// the caret; "/" in the empty field opens the list, where ↑ and ↓ move.
// "Sửa" turns the panel into the list's form, which the chat pane sends in
// place and answers with a fresh panel.

export function mountQuickReplies(composer: HTMLFormElement, field: HTMLTextAreaElement) {
  const pop = document.getElementById('quick-replies');
  const toggle = composer.querySelector<HTMLButtonElement>('[data-replies-toggle]');
  if (!pop || !toggle) return;
  toggle.hidden = false;
  // A save swaps the panel's content, so each look-up reads it afresh.
  const $ = <T extends Element = HTMLElement>(s: string) => pop.querySelector<T>(s)!;
  const options = () => [...pop.querySelectorAll<HTMLButtonElement>('[data-quick-reply]')];
  const form = () => $<HTMLFormElement>('[data-replies-form]');
  const rows = () => $('[data-replies-rows]');

  const showList = () => {
    $('[data-replies-pick]').hidden = false;
    form().hidden = true;
  };
  const count = () => {
    const n = rows().childElementCount;
    const max = Number(form().dataset.max);
    $('[data-replies-count]').textContent = `${n}/${max}`;
    $<HTMLButtonElement>('[data-replies-add]').disabled = n >= max;
  };
  const addRow = (text: string) => {
    const row = ($<HTMLTemplateElement>('[data-replies-row]').content.cloneNode(true) as DocumentFragment).firstElementChild as HTMLElement;
    row.querySelector('textarea')!.value = text;
    rows().append(row);
    return row;
  };
  // The form starts from the list as saved; Hủy and the back arrow drop the edits.
  const edit = () => {
    rows().replaceChildren();
    options().forEach((o) => addRow(o.dataset.quickReply!));
    $('[data-replies-pick]').hidden = true;
    form().hidden = false;
    count();
    (rows().querySelector<HTMLElement>('textarea') ?? $<HTMLButtonElement>('[data-replies-add]')).focus();
  };
  const pick = (text: string) => {
    pop.hidePopover();
    field.focus();
    field.setRangeText(text, field.selectionStart, field.selectionEnd, 'end');
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };

  pop.addEventListener('toggle', (e) => {
    const open = (e as ToggleEvent).newState === 'open';
    toggle.setAttribute('aria-expanded', String(open));
    if (!open) showList();
  });
  pop.addEventListener('click', (e) => {
    const t = e.target as Element;
    const option = t.closest<HTMLElement>('[data-quick-reply]');
    if (option) return pick(option.dataset.quickReply!);
    if (t.closest('[data-replies-edit]')) return edit();
    if (t.closest('[data-replies-back]')) return showList();
    if (t.closest('[data-replies-add]')) {
      addRow('').querySelector('textarea')!.focus();
      return count();
    }
    const drop = t.closest('[data-replies-drop]');
    if (drop) {
      drop.parentElement!.remove();
      count();
    }
  });
  // ↑ and ↓ walk the list, the ends wrapping round; the form keeps them for its fields.
  pop.addEventListener('keydown', (e) => {
    const list = options();
    if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || !form().hidden || !list.length) return;
    e.preventDefault();
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    list[at < 0 ? (step > 0 ? 0 : list.length - 1) : (at + step + list.length) % list.length].focus();
  });
  // The deal the composer is on, which a chip may have changed, comes back after the save.
  pop.addEventListener('submit', () => {
    const deal = composer.querySelector<HTMLInputElement>('input[name="deal"]');
    const mine = form().querySelector<HTMLInputElement>('input[name="deal"]')!;
    mine.value = deal?.value ?? '';
  });
  field.addEventListener('keydown', (e) => {
    if (e.key !== '/' || field.value || e.isComposing) return;
    e.preventDefault();
    pop.showPopover();
    options()[0]?.focus();
  });
}
