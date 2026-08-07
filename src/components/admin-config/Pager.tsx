"use client";

import type { PageMeta } from "@/api/generated/types.gen";

/**
 * The pager for the two page-paginated staff reads.
 *
 * `total_count` is explicitly null on a ranked result, and these two reads are never
 * ranked — but the type says it can be, so the null branch draws "trang N" plus a next
 * button gated on a full page instead of inventing a last page.
 */
export default function Pager({
  meta,
  loadedCount,
  onChange,
}: {
  meta: PageMeta;
  loadedCount: number;
  onChange: (page: number) => void;
}) {
  const hasTotal = meta.total_count !== null;
  const lastPage = hasTotal ? Math.max(1, Math.ceil(meta.total_count! / meta.limit)) : undefined;
  const canPrev = meta.page > 1;
  const canNext = hasTotal ? meta.page < lastPage! : loadedCount >= meta.limit;

  if (!canPrev && !canNext) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-outline-variant">
      <p className="font-body-sm text-on-surface-variant">
        {hasTotal ? `Trang ${meta.page} / ${lastPage} · ${meta.total_count} dòng` : `Trang ${meta.page}`}
      </p>
      <div className="flex items-center gap-2">
        <PagerButton disabled={!canPrev} icon="chevron_left" label="Trang trước" onClick={() => onChange(meta.page - 1)} />
        <PagerButton disabled={!canNext} icon="chevron_right" label="Trang sau" onClick={() => onChange(meta.page + 1)} />
      </div>
    </div>
  );
}

function PagerButton({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center transition-colors hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}
