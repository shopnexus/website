"use client";

import type { Wallet } from "@/api/generated/types.gen";
import { formatMoney } from "@/lib/money";
import Button from "@/components/ui/Button";

type Balance = Pick<Wallet, "currency" | "available_balance" | "held_balance">;

/**
 * The two balances, side by side and never added together.
 *
 * Held money is in escrow against orders that have not closed — it is the seller's and it
 * is not theirs to draw, and one combined "your balance" would promise a payout a refund
 * can still take back. So the sum is not shown at all: there is no number here that means
 * both.
 */
export default function BalanceSummary({
  balance,
  loading,
  onWithdraw,
}: {
  balance: Balance;
  loading: boolean;
  onWithdraw: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-primary bg-primary text-on-primary p-5 md:p-6 flex flex-col">
        <span className="text-label-sm uppercase tracking-wider opacity-80">Số dư khả dụng</span>
        {loading ? (
          <div className="h-7 w-44 rounded-lg bg-on-primary/20 animate-pulse mt-2" />
        ) : (
          <span className="text-price-lg mt-2">
            {formatMoney(balance.available_balance, balance.currency)}
          </span>
        )}
        <p className="text-body-xs opacity-80 mt-2">Có thể rút về tài khoản ngân hàng.</p>
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={onWithdraw}
            disabled={loading || balance.available_balance <= 0}
            icon={<span className="material-symbols-outlined text-[18px]">account_balance</span>}
          >
            Rút tiền
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6 flex flex-col">
        <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
          Đang tạm giữ
        </span>
        {loading ? (
          <div className="h-7 w-44 rounded-lg bg-surface-container-high animate-pulse mt-2" />
        ) : (
          <span className="text-price-lg text-on-surface mt-2">
            {formatMoney(balance.held_balance, balance.currency)}
          </span>
        )}
        <p className="text-body-xs text-on-surface-variant mt-2">
          Tiền của đơn hàng chưa kết thúc. Nền tảng giữ hộ tới khi người mua nhận hàng, sau đó
          khoản này chuyển sang số dư khả dụng.
        </p>
      </div>
    </div>
  );
}
