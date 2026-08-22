"use client";

import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { PAYMENT_SESSION_STATUS_VI, WITHDRAWAL_OUTCOME_VI } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/money";
import { useCancelWithdrawal, useWithdrawals } from "@/hooks/api/useWallet";
import { OUTCOME_STYLES, bankLabel, isCancellable } from "../_lib/wallet.logic";

/**
 * Cash-out requests and where each one got to.
 *
 * Two states are shown, not one: `outcome` is the decision a person made and `status` is
 * where the money reached on the rail. An approved withdrawal that has not paid out yet
 * is a real state, and collapsing the two would leave a seller unable to tell it from one
 * that has landed.
 */
export default function WithdrawalList() {
  const { withdrawals, isLoading } = useWithdrawals();
  const cancelWithdrawal = useCancelWithdrawal();

  const handleCancel = (id: string) => {
    if (!confirm("Hủy yêu cầu rút tiền này? Số tiền sẽ được hoàn lại vào số dư khả dụng.")) return;
    cancelWithdrawal.mutate(id, {
      onSuccess: () => toast.success("Đã hủy yêu cầu. Tiền đã về lại số dư."),
    });
  };

  if (!isLoading && withdrawals.length === 0) {
    return (
      <EmptyState
        icon="payments"
        title="Chưa có yêu cầu rút tiền nào"
        description="Khi số dư khả dụng đã có tiền, bấm “Rút tiền” ở thẻ số dư để chuyển về tài khoản ngân hàng của bạn."
      />
    );
  }

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
      <div className="p-5 md:p-6 border-b border-outline-variant">
        <h2 className="text-title-md text-on-surface">Yêu cầu rút tiền</h2>
      </div>

      {isLoading ? (
        <div className="p-5 md:p-6 flex justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-[28px]">
            progress_activity
          </span>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant">
          {withdrawals.map((withdrawal) => (
            <li key={withdrawal.id} className="p-5 md:p-6 flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-price-lg text-on-surface">
                    {formatMoney(withdrawal.amount, withdrawal.currency)}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-label-sm rounded-full ${OUTCOME_STYLES[withdrawal.outcome]}`}
                  >
                    {WITHDRAWAL_OUTCOME_VI[withdrawal.outcome]}
                  </span>
                  <span className="text-body-xs text-on-surface-variant">
                    Trạng thái giao dịch: {PAYMENT_SESSION_STATUS_VI[withdrawal.status]}
                  </span>
                </div>

                <div className="text-body-sm text-on-surface-variant mt-1">
                  Về {bankLabel(withdrawal.bank_account)} · {withdrawal.bank_account.account_holder}
                </div>
                <div className="text-body-sm text-on-surface-variant mt-0.5">
                  Gửi ngày {new Date(withdrawal.created_at).toLocaleString("vi-VN")}
                  {withdrawal.resolved_at &&
                    ` · Xử lý ngày ${new Date(withdrawal.resolved_at).toLocaleDateString("vi-VN")}`}
                </div>
                {withdrawal.resolution_note && (
                  <div className="text-body-sm text-on-surface mt-2 bg-surface-container-low rounded-lg p-3">
                    {withdrawal.resolution_note}
                  </div>
                )}
              </div>

              {isCancellable(withdrawal) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-error border-error hover:bg-error/10 shrink-0"
                  disabled={cancelWithdrawal.isPending}
                  onClick={() => handleCancel(withdrawal.id)}
                >
                  Hủy yêu cầu
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
