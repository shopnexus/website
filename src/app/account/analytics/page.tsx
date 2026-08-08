"use client";

import { useAnalyticsData } from "./_hooks/useAnalyticsData";
import MetricCard from "./_components/MetricCard";
import OrdersChart from "./_components/OrdersChart";
import { RANGE_DAYS } from "./_lib/summary.logic";
import { formatMoney } from "@/lib/money";
import type { RangeId, SummaryRole } from "./types";

const RANGES: Array<{ id: RangeId; label: string }> = [
  { id: "7d", label: "7 ngày" },
  { id: "30d", label: "30 ngày" },
  { id: "90d", label: "90 ngày" },
];

const ROLES: Array<{ id: SummaryRole; label: string }> = [
  { id: "seller", label: "Tôi bán" },
  { id: "buyer", label: "Tôi mua" },
];

export default function AnalyticsPage() {
  const { range, setRange, role, setRole, metrics, buckets, totals, isLoading, isEmpty } =
    useAnalyticsData();

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-12">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-primary tracking-tight mb-2">
            Thống kê
          </h1>
          <p className="text-on-surface-variant max-w-md font-body-md">
            {RANGE_DAYS[range]} ngày gần nhất, tính theo múi giờ trên máy bạn. Mọi con số dưới đây
            đến từ đơn hàng thật của bạn.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div
            className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30"
            role="group"
            aria-label="Vai trò"
          >
            {ROLES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                aria-pressed={role === option.id}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                  role === option.id
                    ? "bg-surface shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-primary",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div
            className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30"
            role="group"
            aria-label="Khoảng thời gian"
          >
            {RANGES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRange(option.id)}
                aria-pressed={range === option.id}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                  range === option.id
                    ? "bg-surface shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-primary",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} loading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/40 shadow-sm">
          <h2 className="font-headline font-bold text-lg text-primary mb-6">Đơn hàng theo ngày</h2>
          {isEmpty ? (
            <div className="h-56 flex flex-col items-center justify-center text-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-40">bar_chart</span>
              <p className="font-body-md">Chưa có đơn nào trong khoảng thời gian này.</p>
            </div>
          ) : (
            <OrdersChart buckets={buckets} loading={isLoading} />
          )}
        </section>

        <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/40 shadow-sm">
          <h2 className="font-headline font-bold text-lg text-primary mb-2">Tiền hàng đã chốt</h2>
          {/* One row per currency and never a sum: adding two currencies together is a
              figure that means nothing, which is why the API returns them apart. */}
          <p className="text-[11px] text-on-surface-variant mb-6 leading-snug">
            Chỉ tính đơn đã hoàn thành, không gồm phí giao hàng — phí đó là tiền của đơn vị vận
            chuyển.
          </p>

          {isLoading ? (
            <div className="h-10 rounded-lg bg-surface-container-high animate-pulse" />
          ) : totals.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant">
              Chưa có đơn nào hoàn thành trong kỳ.
            </p>
          ) : (
            <ul className="space-y-4">
              {totals.map((total) => (
                <li
                  key={total.currency}
                  className="flex items-baseline justify-between gap-3 border-b border-outline-variant/40 pb-3 last:border-0"
                >
                  <span className="font-label-md text-on-surface-variant">{total.currency}</span>
                  <span className="font-headline font-bold text-xl text-on-surface tabular-nums">
                    {formatMoney(total.amount, total.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
