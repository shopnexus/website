/** In the browser: a plain left click on `a` opens another page of this site in this tab, and no handler took it. */
export const leaves = (a: HTMLAnchorElement, e: MouseEvent) =>
  !e.defaultPrevented &&
  e.button === 0 &&
  !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) &&
  (!a.target || a.target === '_self') &&
  !a.hasAttribute('download') &&
  a.origin === location.origin &&
  !(a.hash && a.pathname + a.search === location.pathname + location.search);
