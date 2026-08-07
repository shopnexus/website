/** Mirrors `tag_id_slug_check` on the server: lowercase kebab, no doubled or edge dashes. */
const TAG_SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const MAX_TAG_SLUG_LENGTH = 100;
export const MAX_TAG_DESCRIPTION_LENGTH = 255;

/**
 * Turn what an operator typed into a slug the column accepts.
 *
 * Vietnamese is the input language here, so the diacritics have to come off before the
 * pattern can pass — "đồ gốm" is a tag somebody will type, and `NFD` plus the combining
 * range handles every letter except `đ`, which is a distinct letter rather than `d` with
 * a mark and so is replaced by hand.
 */
export function toTagSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, MAX_TAG_SLUG_LENGTH)
    // Trimmed after the cut, or truncating mid-word would leave a trailing dash the
    // pattern rejects.
    .replace(/^-+|-+$/g, "");
}

export function isValidTagSlug(slug: string): boolean {
  return slug.length <= MAX_TAG_SLUG_LENGTH && TAG_SLUG_RE.test(slug);
}
