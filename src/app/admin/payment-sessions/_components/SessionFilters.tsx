"use client";

import type { PaymentSessionKind, PaymentSessionStatus } from "@/api/generated/types.gen";
import FilterChips, { Chip } from "@/components/admin-config/FilterChips";
import Panel from "@/components/admin-config/Panel";
import { KIND_FILTERS, LIMIT_CHOICES, STATUS_FILTERS } from "../_lib/sessions.logic";

/**
 * The two filters the route actually applies, and how deep to read.
 *
 * `account_id`, `from` and `to` are in the published spec and the handler behind it reads
 * none of them, so they are not offered: a date range that silently returns everything is
 * worse than no date range at all on the one screen whose job is reconciliation.
 *
 * Both `*_FILTERS` lists carry `undefined` as their "Tất cả" entry, which `FilterChips`
 * draws itself from `value === undefined` — so the entry is dropped here rather than
 * rendered twice.
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
    <Panel className="p-4 sm:p-5 flex flex-col gap-3">
      <FilterChips
        label="Loại"
        value={kind}
        options={KIND_FILTERS.filter((filter) => filter.kind !== undefined).map((filter) => ({
          value: filter.kind as PaymentSessionKind,
          label: filter.label,
        }))}
        onChange={onKindChange}
      />

      <FilterChips
        label="Trạng thái"
        value={status}
        options={STATUS_FILTERS.filter((filter) => filter.status !== undefined).map((filter) => ({
          value: filter.status as PaymentSessionStatus,
          label: filter.label,
        }))}
        onChange={onStatusChange}
      />

      {/* Not a FilterChips: there is no "all" depth to clear back to — one of the three is
          always in force. */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Số dòng mỗi lần đọc">
        <span className="font-label-sm uppercase tracking-[0.08em] text-on-surface-variant">
          Số dòng
        </span>
        {LIMIT_CHOICES.map((choice) => (
          <Chip key={choice} active={choice === limit} onClick={() => onLimitChange(choice)}>
            {choice}
          </Chip>
        ))}
      </div>
    </Panel>
  );
}
