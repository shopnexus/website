"use client";

import type { AdminIdentityDocument } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { IDENTITY_DOCUMENT_TYPE_VI } from "@/lib/dictionaries";
import { needsExpiry } from "../_lib/identity.logic";
import type { VerdictDraft } from "../types";
import ChoiceGroup from "@/components/ui/ChoiceGroup";

/**
 * The verdict.
 *
 * The expiry field appears for the document types that have one and is required with an
 * approval, mirroring the domain rule rather than restating it here: the payout gate reads
 * the date as well as the status, so verifying a passport without one would let it pass
 * for ever.
 */
export default function VerdictDialog({
  target,
  draft,
  onDraftChange,
  problem,
  isPending,
  onClose,
  onSubmit,
}: {
  target: AdminIdentityDocument | null;
  draft: VerdictDraft;
  onDraftChange: (draft: VerdictDraft) => void;
  problem: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!target) return null;

  const verifying = draft.status === "verified";
  const expiryRequired = needsExpiry(target.document.doc_type);

  return (
    <Modal open title="Kết luận hồ sơ định danh" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-xl bg-surface-container-low p-4">
          <div className="font-headline-sm text-on-surface">
            {target.account.name}
          </div>
          <div className="font-body-sm text-on-surface-variant mt-1">
            {IDENTITY_DOCUMENT_TYPE_VI[target.document.doc_type]} · nhà cung cấp{" "}
            <span className="font-mono">{target.document.provider}</span>
          </div>
          {/* Said out loud because the screen looks incomplete otherwise: there is nothing
              else to show, and a moderator hunting for the scans should stop hunting. */}
          <p className="font-body-sm text-on-surface-variant mt-2 leading-relaxed">
            Nền tảng không lưu số trên giấy tờ. Bạn đang xác nhận hoặc bác kết quả kiểm tra
            của nhà cung cấp dựa trên ảnh ở thẻ hồ sơ, không nhập lại thông tin giấy tờ.
          </p>
        </div>

        <ChoiceGroup
          label="Kết luận"
          value={draft.status}
          onChange={(status) => onDraftChange({ ...draft, status })}
          disabled={isPending}
          choices={[
            { value: "verified", label: "Xác thực" },
            { value: "rejected", label: "Từ chối", tone: "danger" },
          ]}
        />

        {verifying && (
          <label className="block">
            <span className="font-label-md text-on-surface block mb-1.5">
              Ngày hết hạn{expiryRequired ? "" : " (không bắt buộc)"}
            </span>
            <Input
              fullWidth
              type="date"
              value={draft.expiresAt}
              onChange={(event) => onDraftChange({ ...draft, expiresAt: event.target.value })}
            />
            <span className="font-body-sm text-on-surface-variant block mt-1.5">
              {expiryRequired
                ? "Loại giấy tờ này có hạn, nên kết luận hợp lệ phải kèm ngày hết hạn."
                : "Loại giấy tờ này có thể không có hạn. Bỏ trống nếu vậy."}
            </span>
          </label>
        )}

        {!verifying && (
          <label className="block">
            <span className="font-label-md text-on-surface block mb-1.5">Lý do từ chối</span>
            <textarea
              value={draft.rejectionReason}
              onChange={(event) =>
                onDraftChange({ ...draft, rejectionReason: event.target.value })
              }
              rows={3}
              maxLength={2000}
              placeholder="Ví dụ: ảnh chụp mờ, không đọc được ngày sinh."
              className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>
        )}

        {problem && <p className="font-body-sm text-error">{problem}</p>}

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Đóng
          </Button>
          <Button
            variant={verifying ? "primary" : "error"}
            onClick={onSubmit}
            disabled={isPending || Boolean(problem)}
          >
            {isPending ? "Đang gửi…" : verifying ? "Ghi kết luận: xác thực" : "Ghi kết luận: từ chối"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
