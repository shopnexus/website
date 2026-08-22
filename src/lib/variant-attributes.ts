/**
 * A variant's attributes — the pairs that tell one variant from another.
 *
 * The server's uniqueness index is over the whole attribute map per listing, so two live
 * variants may not carry the same set; that is what `duplicate_variant` (409) reports.
 */

/** One attribute while it is being edited. `id` is local, so a blank row stays addressable. */
export interface AttributePair {
  id: string;
  key: string;
  value: string;
}

/** Values are `unknown` on the wire; anything not a string is shown as its JSON form. */
function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value) ?? "";
}

/**
 * What a variant is called in a list: its values, in key order.
 *
 * Values alone ("L · Đen") rather than key–value pairs, because within one listing the keys
 * repeat on every row and only the values differ. Sorted by key so the order never shifts.
 */
export function attributeSummary(attributes: Record<string, unknown>): string {
  return Object.keys(attributes)
    .sort()
    .map((key) => asText(attributes[key]))
    .filter(Boolean)
    .join(" · ");
}

/** The full form, for the one place that needs the keys too: the editor. */
export function attributePairs(attributes: Record<string, unknown>): AttributePair[] {
  return Object.keys(attributes)
    .sort()
    .map((key) => ({ id: key, key, value: asText(attributes[key]) }));
}

/** Blank rows are dropped: a half-typed attribute is not one the seller meant to save. */
export function pairsToAttributes(pairs: AttributePair[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of pairs) {
    const key = pair.key.trim();
    const value = pair.value.trim();
    if (key && value) out[key] = value;
  }
  return out;
}

export function attributesEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  return ka.every((key, i) => kb[i] === key && asText(a[key]) === asText(b[key]));
}

let nextPairId = 0;
export function blankPair(): AttributePair {
  nextPairId += 1;
  return { id: `new-${nextPairId}`, key: "", value: "" };
}
