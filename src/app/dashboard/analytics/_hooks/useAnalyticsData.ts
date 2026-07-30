import { useState } from "react";

export type TimeRange = "daily" | "weekly" | "monthly";

export interface Metric {
  id: string;
  label: string;
  value: string;
  change: number;
  icon: string;
}

export function useAnalyticsData() {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");

  // Mock data that changes slightly based on time range
  const metrics: Metric[] = [
    {
      id: "revenue",
      label: "Tổng doanh thu",
      value: timeRange === "daily" ? "12.450.000đ" : timeRange === "weekly" ? "84.500.000đ" : "345.200.000đ",
      change: timeRange === "daily" ? 12.5 : timeRange === "weekly" ? 5.4 : 18.2,
      icon: "payments",
    },
    {
      id: "views",
      label: "Lượt xem trang",
      value: timeRange === "daily" ? "1,204" : timeRange === "weekly" ? "8,450" : "32,100",
      change: timeRange === "daily" ? 8.2 : timeRange === "weekly" ? -1.5 : 12.4,
      icon: "visibility",
    },
    {
      id: "conversion",
      label: "Tỷ lệ chuyển đổi",
      value: timeRange === "daily" ? "3.42%" : timeRange === "weekly" ? "3.55%" : "3.80%",
      change: timeRange === "daily" ? -2.4 : timeRange === "weekly" ? 0.5 : 1.2,
      icon: "ads_click",
    },
    {
      id: "repeat",
      label: "Khách hàng cũ",
      value: timeRange === "daily" ? "24" : timeRange === "weekly" ? "145" : "892",
      change: timeRange === "daily" ? 15.0 : timeRange === "weekly" ? 8.4 : 22.1,
      icon: "group",
    },
  ];

  // Mock chart data
  const revenueChart = [
    { label: "T2", value: 65 },
    { label: "T3", value: 45 },
    { label: "T4", value: 85 },
    { label: "T5", value: 55 },
    { label: "T6", value: 95 },
    { label: "T7", value: 70 },
    { label: "CN", value: 60 },
  ];

  const audienceOrigins = [
    { country: "Hà Nội", percentage: 42, color: "bg-primary" },
    { country: "TP. Hồ Chí Minh", percentage: 35, color: "bg-secondary" },
    { country: "Đà Nẵng", percentage: 12, color: "bg-primary-container" },
    { country: "Khác", percentage: 11, color: "bg-surface-variant" },
  ];

  return {
    timeRange,
    setTimeRange,
    metrics,
    revenueChart,
    audienceOrigins,
  };
}
