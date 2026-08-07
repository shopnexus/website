"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Field from "@/components/admin-config/Field";
import { useSuspendAccount } from "@/hooks/api/useAdminConfig";
import type { AdminAccount } from "@/api/generated/types.gen";
import { nowLocalInputValue, toUntilIso } from "@/lib/admin-suspension";

/**
 * Suspending an account.
 *
 * The two shapes a suspension has are a choice made up front, not a date box left blank:
 * "vĩnh viễn" omits `until` altogether, which is what the server reads as permanent. A
 * blank date field would have made the more serious of the two the accidental default.
 */
export default function SuspensionDialog({
  account,
  onClose,
}: {
  account: AdminAccount;
  onClose: () => void;
}) {
  const suspend = useSuspendAccount();
  const [reason, setReason] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [until, setUntil] = useState("");

  const untilIso = toUntilIso(until);
  const canSubmit =
    reason.trim().length > 0 && (isPermanent || untilIso !== undefined) && !suspend.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    // Omitting `until` is what the server reads as permanent — sending null is a
    // validation failure, not the same fact.
    const deadline = isPermanent ? undefined : untilIso;
    try {
      await suspend.mutateAsync({
        id: account.id,
        body: { reason: reason.trim(), ...(deadline ? { until: deadline } : {}) },
      });
      toast.success(
        deadline
          ? `Đã đình chỉ ${account.name} đến ${new Date(deadline).toLocaleString("vi-VN")}`
          : `Đã đình chỉ vĩnh viễn ${account.name}`,
      );
      onClose();
    } catch {
      // The global handler raises the toast; the form stays open with what was typed.
    }
  };

  return (
    <Modal open title={`Đình chỉ ${account.name}`} onClose={onClose}>
      <div className="space-y-5">
        <p className="font-body-sm text-on-surface-variant">
          Đình chỉ sẽ đăng xuất toàn bộ phiên của tài khoản này ngay lập tức. Tài khoản không bị
          xoá và lịch sử giao dịch được giữ nguyên.
        </p>

        <Field
          label="Lý do"
          hint="Được lưu vào nhật ký kiểm duyệt. Tối đa 2000 ký tự."
        >
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Ví dụ: đăng bán hàng cấm sau khi đã được nhắc nhở."
            className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </Field>

        <fieldset className="space-y-2">
          <legend className="font-label-md text-on-surface mb-1.5">Thời hạn</legend>
          <DurationChoice
            checked={!isPermanent}
            onSelect={() => setIsPermanent(false)}
            title="Có thời hạn"
            detail="Tài khoản được mở lại sau mốc thời gian bên dưới."
          />
          {!isPermanent && (
            <div className="pl-7">
              <input
                type="datetime-local"
                value={until}
                min={nowLocalInputValue()}
                onChange={(event) => setUntil(event.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
          )}
          <DurationChoice
            checked={isPermanent}
            onSelect={() => setIsPermanent(true)}
            title="Vĩnh viễn"
            detail="Không có ngày hết hạn — chỉ gỡ được bằng thao tác gỡ đình chỉ."
          />
        </fieldset>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={suspend.isPending}>
            Huỷ
          </Button>
          <Button variant="error" onClick={handleSubmit} disabled={!canSubmit}>
            {suspend.isPending ? "Đang đình chỉ…" : "Đình chỉ tài khoản"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DurationChoice({
  checked,
  onSelect,
  title,
  detail,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="radio"
        name="suspension-duration"
        checked={checked}
        onChange={onSelect}
        className="mt-1 accent-[var(--color-primary)]"
      />
      <span>
        <span className="font-label-md text-on-surface block">{title}</span>
        <span className="font-body-sm text-on-surface-variant">{detail}</span>
      </span>
    </label>
  );
}
