"use client";

import Skeleton from "@/components/ui/Skeleton";
import { formatMoney } from "@/lib/money";
import type { SessionTotals as Totals } from "../types";

/**
 * What is on screen, added up — the job this page exists for.
 *
 * Says "trên trang này" because that is what it is: the route answers one page, and a
 * figure claiming to be the platform's total would be one nobody could tie back to
 * anything. A zero here is a real answer and renders as a zero, not as a dash.
 */
export default function SessionTotals({
  totals,
  loading,
}: {
  totals: ReadonlyArray<Totals>;
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  if (totals.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="font-label-sm uppercase tracking-wider text-on-surface-variant">
          Tổng trên trang này
        </div>
        <div className="font-headline-md text-on-surface tabular-nums mt-2">
          0
        </div>
        <p className="font-body-sm text-on-surface-variant mt-1">
          Không có phiên thanh toán nào khớp bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {totals.map((row) => (
        <div
          key={row.currency}
          className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-label-sm uppercase tracking-wider text-on-surface-variant">
              {row.currency} · tổng trên trang này
            </span>
            <span className="font-body-sm text-on-surface-variant tabular-nums">
              {row.count} phiên
            </span>
          </div>

          <div className="font-headline-md text-on-surface tabular-nums mt-2">
            {formatMoney(row.total, row.currency)}
          </div>

          <dl className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <dt className="font-body-sm text-on-surface-variant">Đã vào</dt>
              <dd className="font-label-md text-primary tabular-nums mt-0.5">
                {formatMoney(row.settled, row.currency)}
              </dd>
            </div>
            <div>
              <dt className="font-body-sm text-on-surface-variant">Còn phải thu</dt>
              <dd className="font-label-md text-on-surface tabular-nums mt-0.5">
                {formatMoney(row.outstanding, row.currency)}
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
