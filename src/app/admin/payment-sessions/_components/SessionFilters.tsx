"use client";

import type { PaymentSessionKind, PaymentSessionStatus } from "@/api/generated/types.gen";
import { KIND_FILTERS, LIMIT_CHOICES, STATUS_FILTERS } from "../_lib/sessions.logic";

function chipClass(active: boolean): string {
  return [
    "px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all cursor-pointer",
    active
      ? "bg-primary text-on-primary border-primary"
      : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
  ].join(" ");
}

/**
 * The two filters the route actually applies, and how deep to read.
 *
 * `account_id`, `from` and `to` are in the published spec and the handler behind it reads
 * none of them, so they are not offered: a date range that silently returns everything is
 * worse than no date range at all on the one screen whose job is reconciliation.
 */
export default function SessionFilters({
  kind,
  onKindChange,
  status,
  onStatusChange,
  limit,
  onLimitChange,
}: {
  kind: PaymentSessionKind | undefined;
  onKindChange: (kind: PaymentSessionKind | undefined) => void;
  status: PaymentSessionStatus | undefined;
  onStatusChange: (status: PaymentSessionStatus | undefined) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label-sm uppercase tracking-wider text-on-surface-variant w-24 shrink-0">
          Loại
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo loại">
          {KIND_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={filter.kind === kind}
              onClick={() => onKindChange(filter.kind)}
              className={chipClass(filter.kind === kind)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label-sm uppercase tracking-wider text-on-surface-variant w-24 shrink-0">
          Trạng thái
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo trạng thái">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={filter.status === status}
              onClick={() => onStatusChange(filter.status)}
              className={chipClass(filter.status === status)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label-sm uppercase tracking-wider text-on-surface-variant w-24 shrink-0">
          Số dòng
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Số dòng mỗi lần đọc">
          {LIMIT_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              aria-pressed={choice === limit}
              onClick={() => onLimitChange(choice)}
              className={chipClass(choice === limit)}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
