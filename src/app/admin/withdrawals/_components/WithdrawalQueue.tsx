"use client";

import type { PaymentSessionStatus, Withdrawal } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { QUEUE_FILTERS } from "../_lib/withdrawals.logic";
import type { ResolveMode } from "../types";
import WithdrawalRow from "./WithdrawalRow";

/**
 * The queue itself.
 *
 * An empty queue is the good outcome here, not a failure — nobody is waiting for their
 * money — so it says so plainly rather than showing the blank slate of a screen that
 * could not load.
 */
export default function WithdrawalQueue({
  withdrawals,
  status,
  onStatusChange,
  totalCount,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onResolve,
  onInspect,
}: {
  withdrawals: ReadonlyArray<Withdrawal>;
  status: PaymentSessionStatus | undefined;
  onStatusChange: (status: PaymentSessionStatus | undefined) => void;
  totalCount: number | null;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onResolve: (withdrawal: Withdrawal, mode: ResolveMode) => void;
  onInspect: (accountHolder: string) => void;
}) {
  return (
    <section className="bg-surface-container-low rounded-2xl border border-outline-variant/40 overflow-hidden">
      <div className="p-5 border-b border-outline-variant/40 flex flex-wrap items-center gap-2">
        <div className="mr-auto flex items-baseline gap-3">
          <h2 className="font-headline font-bold text-lg text-primary">Hàng đợi</h2>
          {totalCount !== null && (
            <span className="font-body-sm text-on-surface-variant tabular-nums">
              {totalCount} yêu cầu
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
      ) : withdrawals.length === 0 ? (
        <div className="p-14 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl opacity-40 mb-3 block">
            done_all
          </span>
          <p className="font-body-md text-on-surface">Không có yêu cầu nào ở trạng thái này.</p>
          <p className="font-body-sm mt-1">Hàng đợi trống nghĩa là không ai đang chờ tiền.</p>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant/30">
          {withdrawals.map((withdrawal) => (
            <WithdrawalRow
              key={withdrawal.id}
              withdrawal={withdrawal}
              onResolve={onResolve}
              onInspect={onInspect}
            />
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="p-4 border-t border-outline-variant/40 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Đang tải…" : "Tải thêm"}
          </Button>
        </div>
      )}
    </section>
  );
}
