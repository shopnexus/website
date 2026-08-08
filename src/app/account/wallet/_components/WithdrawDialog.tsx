"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { CurrencyCode } from "@/api/generated/types.gen";
import { formatMoney, parseAmount } from "@/lib/money";
import { useBankAccounts, useCreateWithdrawal } from "@/hooks/api/useWallet";
import { bankLabel, withdrawalProblem } from "../_lib/wallet.logic";

/**
 * Raise a cash-out.
 *
 * The whole balance is one press away, because "everything" is what a seller most often
 * means and typing eight digits to say it is a place to make a mistake. The dialog states
 * what happens next rather than implying the money has moved: the request is reviewed by
 * a person, and the debit is reversed if it is refused.
 */
export default function WithdrawDialog({
  open,
  onClose,
  currency,
  available,
}: {
  open: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  available: number;
}) {
  const { data: banks = [] } = useBankAccounts();
  const createWithdrawal = useCreateWithdrawal();

  const [amount, setAmount] = useState(0);
  const [bankAccountId, setBankAccountId] = useState("");

  // The default destination is the one the seller marked default, resolved as the list
  // arrives rather than in an effect that would fight a choice already made.
  const chosen = bankAccountId || banks.find((b) => b.is_default)?.id || banks[0]?.id || "";

  const problem = withdrawalProblem({ amount, bankAccountId: chosen }, available, banks);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (problem) return;

    createWithdrawal.mutate(
      { amount, bank_account_id: chosen, currency },
      {
        onSuccess: () => {
          toast.success("Đã gửi yêu cầu rút tiền. Bộ phận tài chính sẽ duyệt trong ít ngày.");
          setAmount(0);
          onClose();
        },
      },
    );
  };

  return (
    <Modal open={open} title="Rút tiền về ngân hàng" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl bg-surface-container-low p-4 flex items-baseline justify-between">
          <span className="font-label-sm text-on-surface-variant">Số dư khả dụng</span>
          <span className="font-headline font-bold text-lg text-on-surface tabular-nums">
            {formatMoney(available, currency)}
          </span>
        </div>

        <div>
          <label
            htmlFor="withdraw-amount"
            className="block font-label-sm font-semibold text-on-surface mb-1.5"
          >
            Số tiền muốn rút
          </label>
          <div className="flex gap-2">
            <input
              id="withdraw-amount"
              inputMode="numeric"
              value={amount === 0 ? "" : new Intl.NumberFormat("vi-VN").format(amount)}
              onChange={(event) => setAmount(parseAmount(event.target.value))}
              placeholder="0"
              className="flex-1 h-11 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md tabular-nums"
            />
            <Button type="button" variant="outline" onClick={() => setAmount(available)}>
              Tất cả
            </Button>
          </div>
        </div>

        <div>
          <label
            htmlFor="withdraw-bank"
            className="block font-label-sm font-semibold text-on-surface mb-1.5"
          >
            Tài khoản nhận
          </label>
          {banks.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant bg-surface-container-low rounded-lg p-3">
              Chưa có tài khoản ngân hàng nào. Thêm một tài khoản ở thẻ “Tài khoản ngân hàng” rồi
              quay lại đây.
            </p>
          ) : (
            <select
              id="withdraw-bank"
              value={chosen}
              onChange={(event) => setBankAccountId(event.target.value)}
              className="w-full h-11 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
            >
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bankLabel(bank)} — {bank.account_holder}
                </option>
              ))}
            </select>
          )}
        </div>

        <p className="font-body-sm text-on-surface-variant leading-relaxed">
          Tiền được trừ khỏi số dư ngay khi gửi yêu cầu và hoàn lại nếu yêu cầu bị từ chối hoặc bạn
          hủy trước khi được duyệt.
        </p>

        {problem && <p className="font-body-sm text-error">{problem}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Đóng
          </Button>
          <Button type="submit" disabled={Boolean(problem) || createWithdrawal.isPending} fullWidth>
            {createWithdrawal.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
