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
        weight === "settled"
          ? "bg-tertiary-container/15 border-tertiary-container/50 text-on-surface"
          : "bg-surface-container border-outline-variant text-on-surface-variant",
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
