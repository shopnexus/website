"use client";

import type { Wallet } from "@/api/generated/types.gen";
import { DEFAULT_CURRENCY, walletOrZero } from "@/hooks/api/useWallet";
import { formatMoney } from "@/lib/money";

/**
 * What the account holds, per currency.
 *
 * A wallet row is opened by the first movement into it, so an account nobody has paid has
 * no row at all — and that is a zero, not a missing answer. Showing an error, or a dash,
 * would tell an admin the balance is unknown at the moment they are deciding whether to
 * pay it out.
 *
 * The two balances are never added: held money is escrow against orders that have not
 * closed, and a single total would promise a payout that a refund can still take back.
 */
export default function WalletBalances({
  wallets,
  loading,
}: {
  wallets: ReadonlyArray<Wallet>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="h-24 rounded-2xl bg-surface-container-high animate-pulse" aria-hidden />
    );
  }

  // No row at all is the ordinary state of an account that has never been paid, so the
  // platform's own currency is shown at zero rather than nothing being shown.
  const rows = wallets.length > 0 ? wallets : [walletOrZero([], DEFAULT_CURRENCY)];

  return (
    <div className="space-y-3">
      {rows.map((wallet) => (
        <div
          key={wallet.currency}
          className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5"
        >
          <div className="font-label-sm uppercase tracking-wider text-on-surface-variant">
            {wallet.currency}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <div className="font-body-sm text-on-surface-variant">Khả dụng</div>
              <div className="font-headline font-extrabold text-2xl text-primary tabular-nums mt-0.5">
                {formatMoney(wallet.available_balance, wallet.currency)}
              </div>
            </div>
            <div>
              <div className="font-body-sm text-on-surface-variant">Tạm giữ</div>
              <div className="font-headline font-extrabold text-2xl text-on-surface tabular-nums mt-0.5">
                {formatMoney(wallet.held_balance, wallet.currency)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {wallets.length === 0 && (
        <p className="font-body-sm text-on-surface-variant">
          Tài khoản này chưa từng có tiền đi qua ví, nên chưa có sổ ví nào được mở. Số dư bằng
          không là câu trả lời đúng, không phải lỗi tải dữ liệu.
        </p>
      )}
    </div>
  );
}
