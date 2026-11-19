// Forms with data-once send once: a second submit is dropped and the button
// turns off just after the first (turning it off before would drop its name=value).
export function submitOnce(root: ParentNode = document) {
  for (const f of root.querySelectorAll<HTMLFormElement>('form[data-once]:not([data-once-on])')) {
    f.dataset.onceOn = '';
    f.addEventListener('submit', (e) => {
      if (f.dataset.sent) return e.preventDefault();
      f.dataset.sent = '';
      const b = e.submitter as HTMLButtonElement | null;
      if (b) setTimeout(() => (b.disabled = true));
    });
  }
}
