"use client";

import type { Withdrawal } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { formatMoney } from "@/lib/money";
import { bankLabel } from "../_lib/withdrawals.logic";
import type { ResolveDraft, ResolveMode } from "../types";
import ChoiceGroup from "@/components/ui/ChoiceGroup";

/**
 * The decision, with the consequence written above the button.
 *
 * The money left the seller's available balance when they raised the request, so neither
 * verdict is "moving" it: approving records a transfer that already happened outside, and
 * refusing credits it back. Both sentences are on screen because an admin who thinks
 * approving is what debits the wallet will approve one twice.
 */
export default function ResolveWithdrawalDialog({
  target,
  mode,
  onModeChange,
  draft,
  onDraftChange,
  problem,
  isPending,
  onClose,
  onSubmit,
}: {
  target: Withdrawal | null;
  mode: ResolveMode;
  onModeChange: (mode: ResolveMode) => void;
  draft: ResolveDraft;
  onDraftChange: (draft: ResolveDraft) => void;
  problem: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!target) return null;

  const approving = mode === "approve";

  return (
    <Modal open title="Quyết định yêu cầu rút tiền" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-xl bg-surface-container-low p-4">
          <div className="font-headline-md text-on-surface tabular-nums">
            {formatMoney(target.amount, target.currency)}
          </div>
          <div className="font-body-sm text-on-surface-variant mt-1">
            {target.bank_account.account_holder} · {bankLabel(target.bank_account)}
          </div>
        </div>

        <ChoiceGroup
          label="Quyết định"
          value={mode}
          onChange={onModeChange}
          disabled={isPending}
          choices={[
            { value: "approve", label: "Duyệt chi" },
            { value: "reject", label: "Từ chối", tone: "danger" },
          ]}
        />

        <p className="font-body-sm text-on-surface-variant leading-relaxed">
          {approving
            ? "Số tiền đã bị trừ khỏi số dư khả dụng từ lúc người bán gửi yêu cầu. Duyệt là ghi nhận khoản đã chuyển đi, không trừ thêm lần nữa."
            : "Từ chối sẽ hoàn số tiền này về số dư khả dụng của người bán ngay lập tức."}
        </p>

        {approving && (
          <label className="block">
            <span className="font-label-md text-on-surface block mb-1.5">
              Mã giao dịch ngân hàng
            </span>
            <Input
              fullWidth
              value={draft.providerRef}
              onChange={(event) =>
                onDraftChange({ ...draft, providerRef: event.target.value })
              }
              placeholder="Ví dụ: FT24123456789"
              maxLength={200}
            />
          </label>
        )}

        <label className="block">
          <span className="font-label-md text-on-surface block mb-1.5">
            {approving ? "Ghi chú cho người bán (không bắt buộc)" : "Lý do từ chối"}
          </span>
          <textarea
            value={draft.reason}
            onChange={(event) => onDraftChange({ ...draft, reason: event.target.value })}
            rows={3}
            maxLength={500}
            placeholder={
              approving
                ? "Ví dụ: đã chuyển lúc 14:20."
                : "Ví dụ: tên chủ tài khoản không khớp với hồ sơ định danh."
            }
            className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-[16px] text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </label>

        {problem && <p className="font-body-sm text-error">{problem}</p>}

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Đóng
          </Button>
          <Button
            variant={approving ? "primary" : "error"}
            onClick={onSubmit}
            disabled={isPending || Boolean(problem)}
          >
            {isPending ? "Đang gửi…" : approving ? "Xác nhận duyệt chi" : "Xác nhận từ chối"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
