"use client";

import type { CurrencyCode, WalletTransactionKind } from "@/api/generated/types.gen";
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

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline-variant/40 flex flex-wrap items-center gap-2">
        <h2 className="font-headline font-bold text-lg text-primary mr-auto">Lịch sử biến động</h2>
        {KINDS.map((option) => {
          const active = option === "all" ? kind === undefined : kind === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onKindChange(option === "all" ? undefined : option)}
              className={[
                "px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all cursor-pointer",
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
        <div className="p-12 flex justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">
            progress_activity
          </span>
        </div>
      ) : failed ? (
        <div className="p-10 text-center text-on-surface-variant font-body-sm">
          Không tải được lịch sử ví. Vui lòng thử lại.
        </div>
      ) : movements.length === 0 ? (
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl opacity-40 mb-3 block">receipt</span>
          <p className="font-body-md">Chưa có biến động nào.</p>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant/30">
          {movements.map((tx) => {
            const direction = movementDirection(tx);
            return (
              <li key={tx.seq} className="p-5 flex items-start gap-4">
                <span
                  className={[
                    "material-symbols-outlined w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[20px]",
                    direction === "in"
                      ? "bg-secondary-container text-on-secondary-container"
                      : direction === "out"
                        ? "bg-error/10 text-error"
                        : "bg-surface-container-high text-on-surface-variant",
                  ].join(" ")}
                >
                  {KIND_ICONS[tx.kind]}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="font-label-md font-semibold text-on-surface">
                    {WALLET_TRANSACTION_KIND_VI[tx.kind]}
                  </div>
                  <div className="font-body-sm text-on-surface-variant mt-0.5">
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                    <span className="mx-2 opacity-40">·</span>
                    <span className="font-mono text-[11px]">#{tx.seq}</span>
                  </div>
                  {tx.note && (
                    <div className="font-body-sm text-on-surface-variant mt-1">{tx.note}</div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {tx.available_delta !== 0 && (
                    <div
                      className={[
                        "font-label-md font-bold tabular-nums",
                        tx.available_delta > 0 ? "text-primary" : "text-error",
                      ].join(" ")}
                    >
                      {formatSignedMoney(tx.available_delta, tx.currency)}
                    </div>
                  )}
                  {tx.held_delta !== 0 && (
                    <div className="font-body-sm text-on-surface-variant tabular-nums">
                      Tạm giữ {formatSignedMoney(tx.held_delta, tx.currency)}
                    </div>
                  )}
                  <div className="text-[11px] text-on-surface-variant mt-1 tabular-nums">
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
        <div className="p-4 border-t border-outline-variant/40 text-center font-body-sm text-on-surface-variant">
          Đang hiển thị {movements.length} biến động gần nhất trong tổng số {totalCount}.
        </div>
      )}
    </section>
  );
}
