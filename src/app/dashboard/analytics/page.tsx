"use client";

import { useAnalyticsData } from "./_hooks/useAnalyticsData";
import MetricCard from "./_components/MetricCard";
import RevenueChart from "./_components/RevenueChart";

export default function AnalyticsPage() {
  const { timeRange, setTimeRange, metrics } = useAnalyticsData();

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-primary tracking-tight mb-2">Thống kê</h1>
          <p className="text-on-surface-variant max-w-md font-body-md">
            Chỉ số hiệu suất theo thời gian thực và thông tin về khách hàng cho cửa hàng của bạn.
          </p>
        </div>
        
        <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          {(
            [
              { id: "daily", label: "Hôm nay" },
              { id: "weekly", label: "Tuần này" },
              { id: "monthly", label: "Tháng này" },
            ] as const
          ).map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={[
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                timeRange === range.id
                  ? "bg-white shadow-sm text-primary"
                  : "text-on-surface-variant hover:text-primary"
              ].join(" ")}
            >
              {range.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <RevenueChart />
    </div>
  );
}
