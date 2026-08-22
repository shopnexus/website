"use client";

import type { AccountId } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useTaxVerdictForm } from "../_hooks/useTaxVerdictForm";

/**
 * The verdict on a seller's tax registration.
 *
 * There is no staff read of somebody else's registration — the platform only exposes the
 * seller's own — so this form cannot show what it is deciding. It asks for the căn cứ
 * instead: whoever checked the tax code somewhere else records where, and the next person
 * can follow it.
 */
export default function TaxVerificationForm({ accountId }: { accountId: AccountId }) {
  const { draft, setDraft, problem, submit, isPending } = useTaxVerdictForm(accountId);

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
      <h3 className="font-headline-sm text-on-surface">Xác minh đăng ký thuế</h3>
      <p className="font-body-sm text-on-surface-variant mt-1 leading-relaxed">
        Người dùng phải đã khai mã số thuế thì mới có hồ sơ để kết luận. Hệ thống không mở
        hồ sơ thuế của người khác cho nhân viên xem, nên hãy tra ở nguồn chính thức rồi ghi lại
        căn cứ ở đây.
      </p>

      <div className="flex gap-2 mt-4" role="group" aria-label="Kết luận">
        {(["verified", "rejected"] as const).map((status) => {
          const active = draft.status === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => setDraft({ ...draft, status })}
              className={[
                "flex-1 px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer",
                active && status === "verified"
                  ? "bg-primary text-on-primary border-primary"
                  : active
                    ? "bg-error text-on-error border-error"
                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
              ].join(" ")}
            >
              {status === "verified" ? "Hợp lệ" : "Không hợp lệ"}
            </button>
          );
        })}
      </div>

      <label className="block mt-4">
        <span className="font-label-sm text-on-surface-variant block mb-1.5">Căn cứ</span>
        <Input
          fullWidth
          value={draft.source}
          onChange={(event) => setDraft({ ...draft, source: event.target.value })}
          placeholder="Ví dụ: tra cứu tại tracuunnt.gdt.gov.vn ngày 06/08"
          maxLength={200}
        />
      </label>

      <label className="block mt-3">
        <span className="font-label-sm text-on-surface-variant block mb-1.5">
          Ghi chú (không bắt buộc)
        </span>
        <textarea
          value={draft.note}
          onChange={(event) => setDraft({ ...draft, note: event.target.value })}
          rows={2}
          maxLength={2000}
          className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </label>

      {problem && <p className="font-body-sm text-error mt-2">{problem}</p>}

      <div className="flex justify-end mt-4">
        <Button
          variant={draft.status === "verified" ? "primary" : "error"}
          size="sm"
          onClick={submit}
          disabled={isPending || Boolean(problem)}
        >
          {isPending ? "Đang gửi…" : "Ghi kết luận"}
        </Button>
      </div>
    </section>
  );
}
