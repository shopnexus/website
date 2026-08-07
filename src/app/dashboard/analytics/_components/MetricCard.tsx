import type { Metric } from "../types";

/**
 * One headline number.
 *
 * The delta chip is absent — not zero, not a dash — when there is no previous window to
 * compare against, because a shop's first week has no growth rate and printing one is a
 * claim the data does not make.
 */
export default function MetricCard({ metric, loading }: { metric: Metric; loading: boolean }) {
  const positive = metric.change !== null && metric.change > 0;
  const negative = metric.change !== null && metric.change < 0;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <span className="material-symbols-outlined p-2 rounded-xl bg-surface-container-high text-on-surface-variant">
          {metric.icon}
        </span>
        {metric.change !== null && (
          <span
            className={[
              "text-[11px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-0.5",
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

      <p className="text-body-sm text-on-surface-variant mb-1 font-medium">{metric.label}</p>
      {loading ? (
        <div className="h-8 w-28 rounded-md bg-surface-container-high animate-pulse" />
      ) : (
        <h3 className="text-2xl font-bold font-headline tracking-tight text-on-surface tabular-nums">
          {metric.value}
        </h3>
      )}
      <p className="text-[11px] text-on-surface-variant mt-2 leading-snug">
        {metric.change === null ? "Không có kỳ trước để so sánh" : metric.hint}
      </p>
    </div>
  );
}
