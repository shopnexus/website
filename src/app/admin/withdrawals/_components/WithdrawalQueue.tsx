"use client";

import type { PaymentSessionStatus, Withdrawal } from "@/api/generated/types.gen";
import QueuePanel from "@/components/admin-config/QueuePanel";
import QueueTabs from "@/components/admin-config/QueueTabs";
import { QUEUE_FILTERS } from "../_lib/withdrawals.logic";
import type { ResolveMode } from "../types";
import WithdrawalRow from "./WithdrawalRow";

/**
 * The queue itself.
 *
 * An empty queue is the good outcome here, not a failure — nobody is waiting for their
 * money — so it says so plainly rather than showing the blank slate of a screen that
 * could not load.
 *
 * `QUEUE_FILTERS` carries `undefined` as its last entry, which the tab strip cannot hold:
 * a tab has to have an id. "Tất cả" is a reset rather than a sixth status anyway, so it
 * leads the strip instead of trailing it, which is also where the configuration pages'
 * filter chips have always put it.
 */
const ALL = "all" as const;
type Tab = PaymentSessionStatus | typeof ALL;

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: ALL, label: "Tất cả" },
  ...QUEUE_FILTERS.filter((filter) => filter.status !== undefined).map((filter) => ({
    id: filter.status as PaymentSessionStatus,
    label: filter.label,
  })),
];

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
    <>
      <QueueTabs
        tabs={TABS}
        active={status ?? ALL}
        onChange={(id) => onStatusChange(id === ALL ? undefined : id)}
      />

      <QueuePanel
        heading="Hàng đợi"
        count={totalCount}
        countNoun="yêu cầu"
        isLoading={isLoading}
        isEmpty={withdrawals.length === 0}
        emptyIcon="done_all"
        emptyTitle="Không có yêu cầu nào ở trạng thái này."
        emptyHint="Hàng đợi trống nghĩa là không ai đang chờ tiền."
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={onLoadMore}
      >
        {withdrawals.map((withdrawal) => (
          <WithdrawalRow
            key={withdrawal.id}
            withdrawal={withdrawal}
            onResolve={onResolve}
            onInspect={onInspect}
          />
        ))}
      </QueuePanel>
    </>
  );
}
