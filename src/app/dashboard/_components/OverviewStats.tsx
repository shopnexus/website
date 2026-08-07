"use client";

import type { MoneyByCurrency, OrderSummary, Wallet } from "@/api/generated/types.gen";
import { formatMoney } from "@/lib/money";

type Balance = Pick<Wallet, "currency" | "available_balance" | "held_balance">;

interface Reputation {
  completed_orders: number;
  cancelled_orders: number;
  rating_average: number;
  rating_count: number;
}

/**
 * Four numbers, each one the direct answer of an endpoint.
 *
 * Revenue and the order count come from `GET /orders/summary` over the last thirty days,
 * which is the window the seller is actually trading in; the balance and the reputation
 * are lifetime facts and say so. Mixing a window figure with a lifetime one under the
 * same heading is how a dashboard becomes unreadable, so each tile states its own period.
 */
export default function OverviewStats({
  balance,
  balanceLoading,
  summary,
  summaryLoading,
  revenue,
  reputation,
}: {
  balance: Balance;
  balanceLoading: boolean;
  summary: OrderSummary | undefined;
  summaryLoading: boolean;
  revenue: MoneyByCurrency | undefined;
  reputation: Reputation | undefined;
}) {
  const tiles = [
    {
      label: "Số dư khả dụng",
      period: "Hiện tại",
      value: formatMoney(balance.available_balance, balance.currency),
      hint:
        balance.held_balance > 0
          ? `${formatMoney(balance.held_balance, balance.currency)} đang tạm giữ`
          : "Không có khoản nào đang tạm giữ",
      icon: "account_balance_wallet",
      loading: balanceLoading,
    },
    {
      label: "Doanh thu",
      period: "30 ngày",
      value: formatMoney(revenue?.amount ?? 0, revenue?.currency ?? balance.currency),
      hint: "Tiền hàng của đơn đã hoàn thành",
      icon: "payments",
      loading: summaryLoading,
    },
    {
      label: "Đơn hàng",
      period: "30 ngày",
      value: String(
        (summary?.open ?? 0) + (summary?.completed ?? 0) + (summary?.cancelled ?? 0),
      ),
      hint: `${summary?.completed ?? 0} hoàn thành · ${summary?.open ?? 0} đang xử lý`,
      icon: "receipt_long",
      loading: summaryLoading,
    },
    {
      label: "Đánh giá người bán",
      period: "Toàn thời gian",
      value:
        reputation && reputation.rating_count > 0 ? reputation.rating_average.toFixed(1) : "—",
      hint: reputation
        ? `${reputation.rating_count} lượt · ${reputation.completed_orders} đơn đã xong`
        : "Chưa có đánh giá",
      icon: "star",
      loading: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-label-sm text-on-surface-variant">{tile.label}</div>
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 mt-0.5">
                {tile.period}
              </div>
            </div>
            <span className="material-symbols-outlined w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
              {tile.icon}
            </span>
          </div>

          {tile.loading ? (
            <div className="h-8 w-32 rounded-md bg-surface-container-high animate-pulse" />
          ) : (
            <div className="font-headline font-bold text-2xl text-on-surface tabular-nums">
              {tile.value}
            </div>
          )}
          <div className="font-label-sm text-on-surface-variant mt-2">{tile.hint}</div>
        </div>
      ))}
    </div>
  );
}
