"use client";

import type { CurrencyCode, WalletTransactionKind } from "@/api/generated/types.gen";
import EmptyState from "@/components/ui/EmptyState";
import { WALLET_TRANSACTION_KIND_VI } from "@/lib/dictionaries";
import { formatMoney, formatSignedMoney } from "@/lib/money";
import { useWalletLedger } from "@/hooks/api/useWallet";
import { KIND_ICONS, movementDirection } from "../_lib/wallet.logic";

const KINDS: Array<WalletTransactionKind | "all"> = [
  "all",
  "payout",
  "escrow-hold",
  "escrow-release",
  "withdrawal",
  "refund",
  "fee",
  "adjustment",
  "topup",
];

/**
 * Every balance change, newest first, with the balance it left behind.
 *
 * `seq` is on each row on purpose: the ledger is ordered by it rather than by time — two
 * movements can share a timestamp — and a gap in the numbering is how a reader can tell a
 * row is missing rather than absent.
 */
export default function LedgerList({
  currency,
  kind,
  onKindChange,
}: {
  currency: CurrencyCode;
  kind: WalletTransactionKind | undefined;
  onKindChange: (kind: WalletTransactionKind | undefined) => void;
}) {
  const { movements, totalCount, isLoading, failed } = useWalletLedger(currency, kind);

  // A wallet with nothing in it has nothing to filter either, so the filter row goes with
  // the list and the screen becomes one card that says what will fill it.
  if (!isLoading && !failed && kind === undefined && movements.length === 0) {
    return (
      <EmptyState
        icon="receipt_long"
        title="Ví chưa có biến động nào"
        description="Tiền xuất hiện ở đây khi một đơn bán hoàn tất: khoản đang tạm giữ chuyển sang số dư khả dụng và để lại một dòng trong lịch sử."
        action={{ label: "Xem đơn bán", href: "/account/sales" }}
      />
    );
  }

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
      <div className="p-5 md:p-6 border-b border-outline-variant flex flex-wrap items-center gap-2">
        <h2 className="text-title-md text-on-surface mr-auto">Lịch sử biến động</h2>
        {KINDS.map((option) => {
          const active = option === "all" ? kind === undefined : kind === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onKindChange(option === "all" ? undefined : option)}
              className={[
                "px-3 py-1.5 rounded-full border text-label-sm transition-all cursor-pointer",
                active
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
              ].join(" ")}
            >
              {option === "all" ? "Tất cả" : WALLET_TRANSACTION_KIND_VI[option]}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-5 md:p-6 flex justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-[28px]">
            progress_activity
          </span>
        </div>
      ) : failed ? (
        <div className="p-5 md:p-6 text-center text-body-sm text-on-surface-variant">
          Không tải được lịch sử ví. Vui lòng thử lại.
        </div>
      ) : movements.length === 0 ? (
        <div className="p-5 md:p-6 text-center text-body-sm text-on-surface-variant">
          Không có biến động nào thuộc loại này. Chọn “Tất cả” để xem toàn bộ lịch sử ví.
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant">
          {movements.map((tx) => {
            const direction = movementDirection(tx);
            return (
              <li key={tx.seq} className="p-5 md:p-6 flex items-start gap-4">
                <div
                  className={[
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    direction === "in"
                      ? "bg-secondary-container text-on-secondary-container"
                      : direction === "out"
                        ? "bg-error/10 text-error"
                        : "bg-surface-container-high text-on-surface-variant",
                  ].join(" ")}
                >
                  <span className="material-symbols-outlined text-[20px] leading-none">
                    {KIND_ICONS[tx.kind]}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-label-md text-on-surface">
                    {WALLET_TRANSACTION_KIND_VI[tx.kind]}
                  </div>
                  <div className="text-body-sm text-on-surface-variant mt-0.5">
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                    <span className="mx-2 opacity-40">·</span>
                    <span className="tabular-nums">#{tx.seq}</span>
                  </div>
                  {tx.note && (
                    <div className="text-body-sm text-on-surface-variant mt-1">{tx.note}</div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {tx.available_delta !== 0 && (
                    <div
                      className={[
                        "text-price-sm",
                        tx.available_delta > 0 ? "text-primary" : "text-error",
                      ].join(" ")}
                    >
                      {formatSignedMoney(tx.available_delta, tx.currency)}
                    </div>
                  )}
                  {tx.held_delta !== 0 && (
                    <div className="text-body-sm text-on-surface-variant tabular-nums">
                      Tạm giữ {formatSignedMoney(tx.held_delta, tx.currency)}
                    </div>
                  )}
                  <div className="text-body-xs text-on-surface-variant mt-1 tabular-nums">
                    Còn {formatMoney(tx.available_after, tx.currency)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Says what is not on screen instead of implying the list is everything: the
          endpoint has no way to hand this client a second page. */}
      {totalCount !== null && totalCount > movements.length && (
        <div className="p-5 border-t border-outline-variant text-center text-body-sm text-on-surface-variant">
          Đang hiển thị {movements.length} biến động gần nhất trong tổng số {totalCount}.
        </div>
      )}
    </section>
  );
}
