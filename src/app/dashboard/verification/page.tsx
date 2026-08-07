"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIdentityDocuments } from "@/hooks/api/useAccount";
import { IDENTITY_DOCUMENT_TYPE_VI, IDENTITY_STATUS_VI } from "@/lib/dictionaries";
import type { IdentityStatus } from "@/api/generated/types.gen";
import VerificationForm from "./_components/VerificationForm";
import { canSubmitAnother, latestDocument } from "./_lib/kyc.logic";

const STATUS_STYLES: Record<IdentityStatus, string> = {
  pending: "bg-primary-container text-on-primary-container",
  verified: "bg-secondary-container text-on-secondary-container",
  rejected: "bg-error/10 text-error",
};

export default function VerificationPage() {
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { data: history = [], isLoading } = useIdentityDocuments();

  const [formOpen, setFormOpen] = useState(false);

  const latest = latestDocument(history);
  const canSubmit = canSubmitAnother(history);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline-md font-bold text-on-surface mb-2">Xác minh danh tính (KYC)</h1>
        <p className="font-body-sm text-on-surface-variant">
          Xác minh danh tính để mở khóa việc đăng bán và rút tiền về ngân hàng.
        </p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="font-headline-sm font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              Trạng thái hiện tại
            </h2>
            <div className="font-body-md">
              Tài khoản:{" "}
              <strong className="text-on-surface">
                {user?.identity_verified ? "Đã xác minh" : "Chưa xác minh"}
              </strong>
              {latest && !user?.identity_verified && (
                <>
                  {" · "}Giấy tờ gần nhất: {IDENTITY_STATUS_VI[latest.status]}
                </>
              )}
            </div>
            {latest?.status === "rejected" && latest.rejection_reason && (
              <p className="font-body-sm text-error mt-2">
                Lý do từ chối: {latest.rejection_reason}. Bạn có thể gửi lại giấy tờ khác.
              </p>
            )}
            {latest?.status === "pending" && (
              <p className="font-body-sm text-on-surface-variant mt-2 max-w-lg">
                Giấy tờ của bạn đang được kiểm tra. Bạn sẽ nhận được thông báo khi có kết quả.
              </p>
            )}
            {!latest && (
              <p className="font-body-sm text-on-surface-variant mt-2 max-w-lg">
                Chuẩn bị sẵn giấy tờ tuỳ thân và chụp một ảnh chân dung. Quá trình chỉ mất vài phút.
              </p>
            )}
          </div>

          {canSubmit && !formOpen && (
            <Button onClick={() => setFormOpen(true)} className="shrink-0">
              {latest ? "Gửi lại giấy tờ" : "Bắt đầu xác minh"}
            </Button>
          )}
        </div>

        {formOpen && canSubmit && (
          <div className="border-t border-outline-variant pt-6">
            <VerificationForm
              onDone={() => {
                setFormOpen(false);
                // A verdict can land on the same request — a vendor that reads the scans
                // answers now — and `identity_verified` on the account is what the header
                // and the sell route read.
                void fetchProfile();
              }}
            />
          </div>
        )}
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h2 className="font-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">history</span>
          Lịch sử xác minh
        </h2>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <span className="material-symbols-outlined animate-spin text-primary">
              progress_activity
            </span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center p-6 bg-surface-container-lowest rounded-lg border border-outline-variant border-dashed text-on-surface-variant font-body-sm">
            Chưa có lịch sử xác minh nào.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant"
              >
                <div>
                  <div className="font-label-md font-semibold text-on-surface">
                    {IDENTITY_DOCUMENT_TYPE_VI[doc.doc_type]}
                  </div>
                  <div className="font-body-sm text-on-surface-variant">
                    {/* verified_at is the decision date; there is no updated_at. */}
                    {doc.verified_at
                      ? `Xác minh ngày ${new Date(doc.verified_at).toLocaleDateString("vi-VN")}`
                      : `Gửi ngày ${new Date(doc.created_at).toLocaleDateString("vi-VN")}`}
                  </div>
                  {doc.status === "rejected" && doc.rejection_reason && (
                    <div className="font-body-sm text-error mt-1">Lý do: {doc.rejection_reason}</div>
                  )}
                  {doc.expires_at && (
                    <div className="font-body-sm text-on-surface-variant mt-1">
                      Hết hạn {new Date(doc.expires_at).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${STATUS_STYLES[doc.status]}`}
                >
                  {IDENTITY_STATUS_VI[doc.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
