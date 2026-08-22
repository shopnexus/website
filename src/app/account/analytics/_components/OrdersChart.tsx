"use client";

import { shortDate } from "../_lib/summary.logic";
import type { DayBucket } from "../types";

/**
 * Orders placed against orders completed, one column per calendar day.
 *
 * Two series in one column rather than two columns side by side: completed is a subset of
 * placed, so nesting the solid bar inside the outline says "of these, this many closed"
 * without the reader doing arithmetic. Height is scaled to the busiest day in the window,
 * and a window with no orders is not drawn at all — a flat axis of zeroes reads as a
 * broken chart rather than as a quiet month.
 *
 * Labels thin out as the window grows: ninety day-stamps on a phone is a grey smear.
 */
export default function OrdersChart({ buckets, loading }: { buckets: DayBucket[]; loading: boolean }) {
  const peak = Math.max(1, ...buckets.map((b) => b.placed));
  const labelEvery = Math.ceil(buckets.length / 12);

  if (loading) {
    return <div className="h-64 rounded-xl bg-surface-container-high/60 animate-pulse" />;
  }

  return (
    <div>
      <div className="flex items-center gap-5 mb-6 text-label-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border border-primary/50 bg-primary/15" /> Đã đặt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Hoàn thành
        </span>
        <span className="ml-auto tabular-nums">Cao nhất: {peak} đơn/ngày</span>
      </div>

      <div className="h-56 flex items-end gap-[3px]">
        {buckets.map((bucket) => (
          <div key={bucket.date} className="flex-1 h-full flex flex-col justify-end group relative min-w-0">
            <div
              className="w-full rounded-t-[3px] border border-primary/40 border-b-0 bg-primary/10 flex flex-col justify-end transition-colors group-hover:bg-primary/20"
              style={{ height: `${Math.max((bucket.placed / peak) * 100, bucket.placed > 0 ? 4 : 1.5)}%` }}
            >
              <div
                className="w-full bg-primary rounded-t-[2px]"
                style={{
                  height: bucket.placed === 0 ? "0%" : `${(bucket.completed / bucket.placed) * 100}%`,
                }}
              />
            </div>

            {/* A tooltip rather than an always-on value: ninety columns of numbers is
                not a chart. Rendered on focus too, so it is reachable from a keyboard. */}
            <div
              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-inverse-surface px-2.5 py-1.5 text-label-xs text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100 z-10 shadow-md"
              role="tooltip"
            >
              <strong>{shortDate(bucket.date)}</strong> · {bucket.placed} đặt · {bucket.completed} xong
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-outline-variant mt-1" />

      <div className="flex gap-[3px] mt-2">
        {buckets.map((bucket, index) => (
          <div key={bucket.date} className="flex-1 min-w-0 text-center">
            {index % labelEvery === 0 && (
              <span className="text-label-xs text-on-surface-variant tabular-nums">
                {shortDate(bucket.date)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
