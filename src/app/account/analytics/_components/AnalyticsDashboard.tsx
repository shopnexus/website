"use client";

import AccountPage from "@/components/account/AccountPage";
import EmptyState from "@/components/ui/EmptyState";
import { useAnalyticsData } from "../_hooks/useAnalyticsData";
import MetricCard from "./MetricCard";
import OrdersChart from "./OrdersChart";
import { RANGE_DAYS } from "../_lib/summary.logic";
import { formatMoney } from "@/lib/money";
import type { RangeId, SummaryRole } from "../types";

const RANGES: Array<{ id: RangeId; label: string }> = [
  { id: "7d", label: "7 ngày" },
  { id: "30d", label: "30 ngày" },
  { id: "90d", label: "90 ngày" },
];

const ROLES: Array<{ id: SummaryRole; label: string }> = [
  { id: "seller", label: "Tôi bán" },
  { id: "buyer", label: "Tôi mua" },
];

const CARD = "rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6";

const segment = (selected: boolean) =>
  [
    "px-4 py-2 rounded-lg text-label-md transition-all cursor-pointer",
    selected ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-primary",
  ].join(" ");

/**
 * The dashboard body.
 *
 * Split from `page.tsx` so the route can stay a server component and carry its metadata,
 * while the range and role switches — which are client state — stay here beside the
 * numbers they filter.
 */
export default function AnalyticsDashboard() {
  const { range, setRange, role, setRole, metrics, buckets, totals, isLoading, isEmpty } =
    useAnalyticsData();

  return (
    <AccountPage
      title="Thống kê"
      description={`${RANGE_DAYS[range]} ngày gần nhất, tính theo múi giờ trên máy bạn. Mọi con số dưới đây đến từ đơn hàng thật của bạn.`}
      width="wide"
      actions={
        <div className="flex flex-wrap gap-3">
          <div
            className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant"
            role="group"
            aria-label="Vai trò"
          >
            {ROLES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                aria-pressed={role === option.id}
                className={segment(role === option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div
            className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant"
            role="group"
            aria-label="Khoảng thời gian"
          >
            {RANGES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRange(option.id)}
                aria-pressed={range === option.id}
                className={segment(range === option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} loading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isEmpty ? (
            <EmptyState
              icon="bar_chart"
              title="Chưa có đơn nào trong kỳ này"
              description={
                role === "seller"
                  ? "Không có đơn nào được đặt trong khoảng thời gian đã chọn. Đăng thêm sản phẩm hoặc mở rộng khoảng thời gian để thấy biểu đồ theo ngày."
                  : "Bạn chưa đặt đơn nào trong khoảng thời gian đã chọn. Mở rộng khoảng thời gian để thấy biểu đồ theo ngày."
              }
              action={
                role === "seller" ? { label: "Đăng sản phẩm mới", href: "/sell" } : undefined
              }
            />
          ) : (
            <section className={CARD}>
              <h2 className="text-title-md text-on-surface mb-6">Đơn hàng theo ngày</h2>
              <OrdersChart buckets={buckets} loading={isLoading} />
            </section>
          )}
        </div>

        <div>
          {/* One row per currency and never a sum: adding two currencies together is a
              figure that means nothing, which is why the API returns them apart. */}
          {isLoading ? (
            <section className={CARD}>
              <h2 className="text-title-md text-on-surface mb-2">Tiền hàng đã chốt</h2>
              <div className="h-10 rounded-lg bg-surface-container-high animate-pulse mt-6" />
            </section>
          ) : totals.length === 0 ? (
            <EmptyState
              icon="payments"
              title="Chưa chốt được đồng nào"
              description="Tiền hàng chỉ được tính khi đơn đã hoàn thành. Kỳ này chưa có đơn nào đi đến bước đó."
            />
          ) : (
            <section className={CARD}>
              <h2 className="text-title-md text-on-surface mb-2">Tiền hàng đã chốt</h2>
              <p className="text-body-xs text-on-surface-variant mb-6">
                Chỉ tính đơn đã hoàn thành, không gồm phí giao hàng — phí đó là tiền của đơn vị vận
                chuyển.
              </p>
              <ul className="space-y-4">
                {totals.map((total) => (
                  <li
                    key={total.currency}
                    className="flex items-baseline justify-between gap-3 border-b border-outline-variant pb-3 last:border-0"
                  >
                    <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      {total.currency}
                    </span>
                    <span className="text-price-lg text-on-surface">
                      {formatMoney(total.amount, total.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </AccountPage>
  );
}
