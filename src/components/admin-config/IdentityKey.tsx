"use client";

import { useCopyKey } from "./hooks/useCopyKey";

/**
 * The permanent handle of a row, rendered the same way on all five configuration
 * surfaces: an account id, a category id, a tag slug, an option slug.
 *
 * It is the through-line of this section because it is the one thing these pages have in
 * common — the display name of every row here is editable and the key never is. `weight`
 * separates an opaque generated id from a *natural* key that is the row's whole identity
 * (a tag slug, an option slug): for those, a different key is a different row, not a
 * rename, so they are marked rather than shown in the same grey as an account id.
 */
export default function IdentityKey({
  value,
  weight = "opaque",
  title,
}: {
  value: string;
  weight?: "opaque" | "settled";
  title?: string;
}) {
  const { copiedKey, copy } = useCopyKey();
  const isCopied = copiedKey === value;

  return (
    <button
      type="button"
      onClick={() => void copy(value)}
      title={title ?? "Nhấn để sao chép"}
      className={[
"group inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-body-xs leading-5",
        "border transition-colors cursor-pointer max-w-full",
        // `settled` used to be a wash of `tertiary-container`, which in this palette is
        // #924628 — so a page that is nothing but natural keys (the tag dictionary) came out
        // tinted salmon, and every row read as though it were in a warning state. A hint of
        // the brand says "this one is the identity" without claiming anything is wrong.
        weight === "settled"
          ? "border-primary/25 bg-primary/[0.06] text-on-surface"
          : "border-outline-variant bg-surface-container text-on-surface-variant",
      ].join(" ")}
    >
      <span className="truncate">{value}</span>
      <span
        aria-hidden
        className="material-symbols-outlined text-[13px] opacity-0 group-hover:opacity-70 transition-opacity"
      >
        {isCopied ? "check" : "content_copy"}
      </span>
      <span className="sr-only">{isCopied ? "Đã sao chép" : "Sao chép mã định danh"}</span>
    </button>
  );
}
