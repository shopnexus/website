"use client";

import type { AdminIdentityDocument, IdentityStatus } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { QUEUE_FILTERS } from "../_lib/identity.logic";
import IdentityCard from "./IdentityCard";

export default function IdentityQueue({
  entries,
  status,
  onStatusChange,
  totalCount,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onDecide,
}: {
  entries: ReadonlyArray<AdminIdentityDocument>;
  status: IdentityStatus | undefined;
  onStatusChange: (status: IdentityStatus | undefined) => void;
  totalCount: number | null;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onDecide: (entry: AdminIdentityDocument) => void;
}) {
  return (
    <section className="bg-surface-container-low rounded-2xl border border-outline-variant/40 overflow-hidden">
      <div className="p-5 border-b border-outline-variant/40 flex flex-wrap items-center gap-2">
        <div className="mr-auto flex items-baseline gap-3">
          <h2 className="font-headline font-bold text-lg text-primary">Hàng đợi</h2>
          {totalCount !== null && (
            <span className="font-body-sm text-on-surface-variant tabular-nums">
              {totalCount} hồ sơ
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo trạng thái">
          {QUEUE_FILTERS.map((filter) => {
            const active = filter.status === status;
            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={active}
                onClick={() => onStatusChange(filter.status)}
                className={[
                  "px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all cursor-pointer",
                  active
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
                ].join(" ")}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">
            progress_activity
          </span>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-14 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl opacity-40 mb-3 block">badge</span>
          <p className="font-body-md text-on-surface">Không có hồ sơ nào ở trạng thái này.</p>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant/30">
          {entries.map((entry) => (
            <IdentityCard key={entry.document.id} entry={entry} onDecide={onDecide} />
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="p-4 border-t border-outline-variant/40 flex justify-center">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Đang tải…" : "Tải thêm"}
          </Button>
        </div>
      )}
    </section>
  );
}
