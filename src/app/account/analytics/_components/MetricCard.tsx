import type { Metric } from "../types";

/**
 * One headline number.
 *
 * Every tile is the same shell and the same number size, so the four read as one row of
 * facts rather than four competing cards. The delta chip is absent — not zero, not a dash —
 * when there is no previous window to compare against, because a shop's first week has no
 * growth rate and printing one is a claim the data does not make. Where the chip would be,
 * the card says so, so the gap is an answer rather than a missing element.
 *
 * The hint underneath is always the metric's own: "1 đơn đã hủy" is true whether or not
 * anything is being compared. It used to be replaced by "Không có kỳ trước để so sánh"
 * whenever there was no chip — which put that sentence under the cancellation rate, a metric
 * that is never compared, on a page whose other three cards were showing deltas against the
 * previous period. The page was contradicting itself in the same row.
 */
export default function MetricCard({ metric, loading }: { metric: Metric; loading: boolean }) {
  const positive = metric.change !== null && metric.change > 0;
  const negative = metric.change !== null && metric.change < 0;

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex justify-between items-start mb-4">
        <span className="material-symbols-outlined p-2 rounded-xl bg-surface-container-high text-on-surface-variant text-[20px]">
          {metric.icon}
        </span>
        {metric.comparable && metric.change === null && (
          <span className="text-label-xs text-on-surface-variant">Chưa có kỳ trước</span>
        )}
        {metric.change !== null && (
          <span
            className={[
              "text-label-xs px-2 py-1 rounded-full inline-flex items-center gap-0.5",
              positive ? "text-primary bg-primary/10" : "",
              negative ? "text-error bg-error/10" : "",
              !positive && !negative ? "text-on-surface-variant bg-surface-container-high" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="material-symbols-outlined text-[13px]">
              {positive ? "trending_up" : negative ? "trending_down" : "trending_flat"}
            </span>
            {positive ? "+" : ""}
            {metric.change}%
          </span>
        )}
      </div>

      <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
        {metric.label}
      </p>
      {loading ? (
        <div className="h-9 w-28 rounded-md bg-surface-container-high animate-pulse mt-1" />
      ) : (
        <p className="text-display-sm text-on-surface tabular-nums mt-1 break-words">
          {metric.value}
        </p>
      )}
      <p className="text-body-xs text-on-surface-variant mt-2">{metric.hint}</p>
    </div>
  );
}
