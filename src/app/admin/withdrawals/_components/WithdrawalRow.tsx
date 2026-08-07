"use client";

import type { Withdrawal } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { PAYMENT_SESSION_STATUS_VI, WITHDRAWAL_OUTCOME_VI } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/money";
import { OUTCOME_CHIP, OUTCOME_RAIL, bankLabel, isAwaitingReview } from "../_lib/withdrawals.logic";
import type { ResolveMode } from "../types";

/**
 * One cash-out, read the way a statement is read: the rail states where it got to, the
 * amount is the first thing on the line, and the destination sits under it.
 *
 * Both states are shown and never merged. `outcome` is the decision a person made,
 * `status` is where the money reached on the rail — an approved withdrawal that has not
 * settled yet is a real state, and one label for both would hide it.
 */
export default function WithdrawalRow({
  withdrawal,
  onResolve,
  onInspect,
}: {
  withdrawal: Withdrawal;
  onResolve: (withdrawal: Withdrawal, mode: ResolveMode) => void;
  onInspect: (accountHolder: string) => void;
}) {
  const pending = isAwaitingReview(withdrawal);

  return (
    <li className="flex">
      <span className={`w-1 shrink-0 ${OUTCOME_RAIL[withdrawal.outcome]}`} aria-hidden />

      <div className="flex-1 min-w-0 p-5 flex flex-wrap items-start gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-headline font-extrabold text-2xl text-on-surface tabular-nums tracking-tight">
              {formatMoney(withdrawal.amount, withdrawal.currency)}
            </span>
            <span
              className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${OUTCOME_CHIP[withdrawal.outcome]}`}
            >
              {WITHDRAWAL_OUTCOME_VI[withdrawal.outcome]}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Giao dịch: {PAYMENT_SESSION_STATUS_VI[withdrawal.status]}
            </span>
          </div>

          <div className="font-body-sm text-on-surface mt-2">
            <span className="font-semibold">{withdrawal.bank_account.account_holder}</span>
            <span className="mx-2 text-outline">·</span>
            <span className="font-mono text-[13px]">{bankLabel(withdrawal.bank_account)}</span>
          </div>

          <div className="font-body-sm text-on-surface-variant mt-1">
            Gửi {new Date(withdrawal.created_at).toLocaleString("vi-VN")}
            {withdrawal.resolved_at &&
              ` · Xử lý ${new Date(withdrawal.resolved_at).toLocaleString("vi-VN")}`}
            <span className="mx-2 text-outline">·</span>
            <span className="font-mono text-[11px]">{withdrawal.id}</span>
          </div>

          {withdrawal.resolution_note && (
            <p className="font-body-sm text-on-surface mt-3 bg-surface-container-high rounded-lg p-3">
              {withdrawal.resolution_note}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Approving a payout without seeing the balance behind it is guesswork, so the
              inspector is one press from every row — including the settled ones, which is
              where a "where did this money go" question starts. */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInspect(withdrawal.bank_account.account_holder)}
            icon={<span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>}
          >
            Xem ví
          </Button>

          {pending && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-error border-error hover:bg-error/10 hover:text-error"
                onClick={() => onResolve(withdrawal, "reject")}
              >
                Từ chối
              </Button>
              <Button variant="primary" size="sm" onClick={() => onResolve(withdrawal, "approve")}>
                Duyệt chi
              </Button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
