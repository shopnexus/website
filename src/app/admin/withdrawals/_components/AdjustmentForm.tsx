"use client";

import type { AccountId } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatSignedMoney } from "@/lib/money";
import { useAdjustmentForm } from "../_hooks/useAdjustmentForm";
import { parseSignedAmount } from "../_lib/withdrawals.logic";

/**
 * Staff moving money by hand.
 *
 * Says what it is before it asks for anything: this is the one movement with no order and
 * no payment session behind it, so the row it writes into the seller's ledger — and the
 * reason on that row — is the entire record anybody will ever have of why their balance
 * changed.
 */
export default function AdjustmentForm({
  accountId,
  currency,
}: {
  accountId: AccountId;
  currency: string;
}) {
  const { draft, setDraft, problem, submit, isPending } = useAdjustmentForm(accountId, currency);

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
      <h3 className="font-headline-sm text-on-surface">Điều chỉnh số dư</h3>
      <p className="font-body-sm text-on-surface-variant mt-1 leading-relaxed">
        Thao tác này ghi thẳng một bút toán vào sổ ví của người dùng, không có đơn hàng hay
        phiên thanh toán nào phía sau. Số âm là trừ tiền. Lý do bên dưới là toàn bộ giải trình
        mà người dùng và bộ phận kiểm toán đọc được.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <label className="block">
          <span className="font-label-sm text-on-surface-variant block mb-1.5">
            Số dư khả dụng ({currency})
          </span>
          <Input
            fullWidth
            inputMode="numeric"
            value={draft.availableDelta === 0 ? "" : String(draft.availableDelta)}
            onChange={(event) =>
              setDraft({ ...draft, availableDelta: parseSignedAmount(event.target.value) })
            }
            placeholder="0"
          />
        </label>

        <label className="block">
          <span className="font-label-sm text-on-surface-variant block mb-1.5">
            Số dư tạm giữ ({currency})
          </span>
          <Input
            fullWidth
            inputMode="numeric"
            value={draft.heldDelta === 0 ? "" : String(draft.heldDelta)}
            onChange={(event) =>
              setDraft({ ...draft, heldDelta: parseSignedAmount(event.target.value) })
            }
            placeholder="0"
          />
        </label>
      </div>

      {(draft.availableDelta !== 0 || draft.heldDelta !== 0) && (
        <p className="font-body-sm text-on-surface mt-3 tabular-nums">
          Sẽ ghi:{" "}
          {draft.availableDelta !== 0 && (
            <span className={draft.availableDelta > 0 ? "text-primary" : "text-error"}>
              khả dụng {formatSignedMoney(draft.availableDelta, draft.currency)}
            </span>
          )}
          {draft.availableDelta !== 0 && draft.heldDelta !== 0 && ", "}
          {draft.heldDelta !== 0 && (
            <span className={draft.heldDelta > 0 ? "text-primary" : "text-error"}>
              tạm giữ {formatSignedMoney(draft.heldDelta, draft.currency)}
            </span>
          )}
        </p>
      )}

      <label className="block mt-4">
        <span className="font-label-sm text-on-surface-variant block mb-1.5">Lý do</span>
        <textarea
          value={draft.reason}
          onChange={(event) => setDraft({ ...draft, reason: event.target.value })}
          rows={2}
          maxLength={2000}
          placeholder="Ví dụ: hoàn phí thu nhầm của đơn ord_xxx theo yêu cầu hỗ trợ #123."
          className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </label>

      {problem && <p className="font-body-sm text-error mt-2">{problem}</p>}

      <div className="flex justify-end mt-4">
        <Button
          variant="primary"
          size="sm"
          onClick={submit}
          disabled={isPending || Boolean(problem)}
        >
          {isPending ? "Đang ghi…" : "Ghi bút toán"}
        </Button>
      </div>
    </section>
  );
}
