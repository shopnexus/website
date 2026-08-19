"use client";

import type { AdminIdentityDocument, IdentityStatus } from "@/api/generated/types.gen";
import QueuePanel from "@/components/admin-config/QueuePanel";
import QueueTabs from "@/components/admin-config/QueueTabs";
import { QUEUE_FILTERS } from "../_lib/identity.logic";
import IdentityCard from "./IdentityCard";

/** "Tất cả" is a reset rather than a fourth status, so it leads the strip. */
const ALL = "all" as const;
type Tab = IdentityStatus | typeof ALL;

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: ALL, label: "Tất cả" },
  ...QUEUE_FILTERS.filter((filter) => filter.status !== undefined).map((filter) => ({
    id: filter.status as IdentityStatus,
    label: filter.label,
  })),
];

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
    <>
      <QueueTabs
        tabs={TABS}
        active={status ?? ALL}
        onChange={(id) => onStatusChange(id === ALL ? undefined : id)}
      />

      <QueuePanel
        heading="Hàng đợi"
        count={totalCount}
        countNoun="hồ sơ"
        isLoading={isLoading}
        isEmpty={entries.length === 0}
        emptyIcon="badge"
        emptyTitle="Không có hồ sơ nào ở trạng thái này."
        emptyHint="Hàng đợi trống nghĩa là không người bán nào đang chờ được mở cổng chi tiền."
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={onLoadMore}
      >
        {entries.map((entry) => (
          <IdentityCard key={entry.document.id} entry={entry} onDecide={onDecide} />
        ))}
      </QueuePanel>
    </>
  );
}
