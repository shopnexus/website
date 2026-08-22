"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import type { TaxCodeType, UpsertTaxInfoRequest } from "@/api/generated/types.gen";
import { TAX_CODE_TYPE_VI, TAX_VERIFICATION_STATUS_VI } from "@/lib/dictionaries";
import { useSaveTaxInfo, useTaxInfo } from "@/hooks/api/useWallet";

const TYPES: TaxCodeType[] = ["individual", "household", "business"];

const STATUS_STYLES = {
  pending: "bg-primary-container text-on-primary-container",
  verified: "bg-secondary-container text-on-secondary-container",
  rejected: "bg-error/10 text-error",
} as const;

/**
 * The seller's tax registration.
 *
 * Saving replaces the registration and resets the verdict — the server says so — so a
 * verified seller is warned before overwriting one rather than discovering afterwards
 * that they are back in the queue.
 */
export default function TaxInfoCard() {
  const { taxInfo, registered, isLoading, failed } = useTaxInfo();
  const saveTaxInfo = useSaveTaxInfo();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpsertTaxInfoRequest>({
    legal_name: "",
    tax_code: "",
    tax_code_type: "individual",
  });

  const openEditor = () => {
    setForm(
      taxInfo
        ? {
            legal_name: taxInfo.legal_name,
            tax_code: taxInfo.tax_code,
            tax_code_type: taxInfo.tax_code_type,
          }
        : { legal_name: "", tax_code: "", tax_code_type: "individual" },
    );
    setEditing(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (taxInfo?.verification_status === "verified") {
      if (!confirm("Thay đổi đăng ký thuế sẽ hủy kết quả xác minh hiện tại. Tiếp tục?")) return;
    }
    saveTaxInfo.mutate(
      {
        legal_name: form.legal_name.trim(),
        tax_code: form.tax_code.replace(/\s+/g, ""),
        tax_code_type: form.tax_code_type,
      },
      {
        onSuccess: () => {
          toast.success("Đã lưu đăng ký thuế.");
          setEditing(false);
        },
      },
    );
  };

  const complete = form.legal_name.trim() && form.tax_code.trim();

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
      <div className="p-5 md:p-6 border-b border-outline-variant flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title-md text-on-surface">Đăng ký thuế</h2>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-lg">
            Mã số thuế dùng cho việc kê khai doanh thu bán hàng của bạn.
          </p>
        </div>
        {!editing && (
          <Button size="sm" variant="outline" onClick={openEditor} disabled={isLoading}>
            {registered ? "Cập nhật" : "Đăng ký"}
          </Button>
        )}
      </div>

      <div className="p-5 md:p-6">
        {isLoading ? (
          <div className="h-16 rounded-xl bg-surface-container-high animate-pulse" />
        ) : failed ? (
          <p className="text-body-sm text-on-surface-variant">
            Không tải được thông tin thuế. Vui lòng thử lại.
          </p>
        ) : editing ? (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label
                htmlFor="tax-type"
                className="block text-label-md text-on-surface mb-1.5"
              >
                Loại người nộp thuế
              </label>
              <select
                id="tax-type"
                value={form.tax_code_type}
                onChange={(event) =>
                  setForm({ ...form, tax_code_type: event.target.value as TaxCodeType })
                }
                className="w-full h-11 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
              >
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TAX_CODE_TYPE_VI[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tax-name"
                className="block text-label-md text-on-surface mb-1.5"
              >
                Tên trên đăng ký thuế
              </label>
              <input
                id="tax-name"
                value={form.legal_name}
                onChange={(event) => setForm({ ...form, legal_name: event.target.value })}
                className="w-full h-11 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
              />
            </div>

            <div>
              <label
                htmlFor="tax-code"
                className="block text-label-md text-on-surface mb-1.5"
              >
                Mã số thuế
              </label>
              <input
                id="tax-code"
                inputMode="numeric"
                value={form.tax_code}
                onChange={(event) => setForm({ ...form, tax_code: event.target.value })}
                placeholder="10 chữ số, hoặc 10 chữ số kèm 3 chữ số chi nhánh"
                className="w-full h-11 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md tabular-nums"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!complete || saveTaxInfo.isPending}>
                {saveTaxInfo.isPending ? "Đang lưu..." : "Lưu đăng ký"}
              </Button>
            </div>
          </form>
        ) : !taxInfo ? (
          <div className="text-center py-6">
            <span
              className="material-symbols-outlined text-[32px] text-on-surface-variant mb-3 block"
              aria-hidden="true"
            >
              receipt_long
            </span>
            <p className="text-title-md text-on-surface">Chưa đăng ký thông tin thuế</p>
            <p className="text-body-sm text-on-surface-variant mt-1.5 max-w-[46ch] mx-auto">
              Khai mã số thuế một lần, rồi doanh thu bán hàng của bạn được kê khai đúng chỗ.
            </p>
          </div>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <dt className="text-label-sm text-on-surface-variant">Tên trên đăng ký</dt>
              <dd className="text-label-md text-on-surface mt-1">{taxInfo.legal_name}</dd>
            </div>
            <div>
              <dt className="text-label-sm text-on-surface-variant">Mã số thuế</dt>
              <dd className="text-label-md text-on-surface mt-1 tabular-nums">
                {taxInfo.tax_code}
              </dd>
            </div>
            <div>
              <dt className="text-label-sm text-on-surface-variant">Loại</dt>
              <dd className="text-label-md text-on-surface mt-1">
                {TAX_CODE_TYPE_VI[taxInfo.tax_code_type]}
              </dd>
            </div>
            <div>
              <dt className="text-label-sm text-on-surface-variant">Tình trạng xác minh</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 py-1 text-label-sm rounded-full ${STATUS_STYLES[taxInfo.verification_status]}`}
                >
                  {TAX_VERIFICATION_STATUS_VI[taxInfo.verification_status]}
                </span>
                {taxInfo.verified_at && (
                  <span className="ml-2 text-body-xs text-on-surface-variant">
                    {new Date(taxInfo.verified_at).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
}
