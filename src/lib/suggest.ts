// What the header's search dropdown offers for the words typed so far: past
// searches that hold them and categories whose name they name. Matching
// ignores case and Vietnamese accents, so "do choi" finds "Đồ chơi".

/** A category as the dropdown lists it; `parent` is the root's name for a subcategory. */
export interface CategoryOption {
  code: string;
  name: string;
  /** The root's code, which gives the icon and the page. */
  root: string;
  parent?: string;
}

/** Lower case, no accents, single spaces: "Đồ  Chơi" is "do choi". */
export const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Each typed word starts a word of the name, or the name is a phrase inside the words. */
function names(name: string, typed: string) {
  const words = name.split(' ');
  return typed.split(' ').every((t) => words.some((w) => w.startsWith(t))) || ` ${typed} `.includes(` ${name} `);
}

/** Up to `n` categories the words name, subcategories after their roots. */
export function matchCategories(all: CategoryOption[], q: string, n = 4): CategoryOption[] {
  const typed = fold(q);
  if (typed.length < 2) return [];
  return all.filter((c) => names(fold(c.name), typed)).slice(0, n);
}

/** Up to `n` past searches that hold the words, other than the words themselves. */
export function matchRecent(recent: string[], q: string, n = 4): string[] {
  const typed = fold(q);
  if (!typed) return [];
  return recent.filter((r) => fold(r) !== typed && fold(r).includes(typed)).slice(0, n);
}
