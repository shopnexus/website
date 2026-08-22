"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIdentityDocuments } from "@/hooks/api/useAccount";
import { IDENTITY_DOCUMENT_TYPE_VI, IDENTITY_STATUS_VI } from "@/lib/dictionaries";
import type { IdentityStatus } from "@/api/generated/types.gen";
import VerificationForm from "./VerificationForm";
import { canSubmitAnother, latestDocument } from "../_lib/kyc.logic";

const STATUS_STYLES: Record<IdentityStatus, string> = {
  pending: "bg-primary-container text-on-primary-container",
  verified: "bg-secondary-container text-on-secondary-container",
  rejected: "bg-error/10 text-error",
};

const CARD = "rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6";

/** Where the account stands, the form that changes it, and every attempt so far. */
export default function VerificationPanel() {
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { data: history = [], isLoading } = useIdentityDocuments();

  const [formOpen, setFormOpen] = useState(false);

  const latest = latestDocument(history);
  const canSubmit = canSubmitAnother(history);

  return (
    <div className="space-y-6">
      <section className={`${CARD} space-y-5`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="text-title-md text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              Trạng thái hiện tại
            </h2>
            <div className="text-body-md">
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
              <p className="text-body-sm text-error mt-2">
                Lý do từ chối: {latest.rejection_reason}. Bạn có thể gửi lại giấy tờ khác.
              </p>
            )}
            {latest?.status === "pending" && (
              <p className="text-body-sm text-on-surface-variant mt-2 max-w-[62ch]">
                Giấy tờ của bạn đang được kiểm tra. Bạn sẽ nhận được thông báo khi có kết quả.
              </p>
            )}
            {!latest && (
              <p className="text-body-sm text-on-surface-variant mt-2 max-w-[62ch]">
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
      </section>

      {isLoading ? (
        <div className={`${CARD} flex justify-center`}>
          <span className="material-symbols-outlined animate-spin text-primary text-[28px]">
            progress_activity
          </span>
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon="history"
          title="Chưa có lần xác minh nào"
          description="Mỗi lần bạn gửi giấy tờ, lần gửi đó và kết quả của nó sẽ được ghi lại ở đây."
        />
      ) : (
        <section className={CARD}>
          <h2 className="text-title-md text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            Lịch sử xác minh
          </h2>

          <div className="space-y-4">
            {history.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-low"
              >
                <div>
                  <div className="text-label-md text-on-surface">
                    {IDENTITY_DOCUMENT_TYPE_VI[doc.doc_type]}
                  </div>
                  <div className="text-body-sm text-on-surface-variant">
                    {/* verified_at is the decision date; there is no updated_at. */}
                    {doc.verified_at
                      ? `Xác minh ngày ${new Date(doc.verified_at).toLocaleDateString("vi-VN")}`
                      : `Gửi ngày ${new Date(doc.created_at).toLocaleDateString("vi-VN")}`}
                  </div>
                  {doc.status === "rejected" && doc.rejection_reason && (
                    <div className="text-body-sm text-error mt-1">Lý do: {doc.rejection_reason}</div>
                  )}
                  {doc.expires_at && (
                    <div className="text-body-sm text-on-surface-variant mt-1">
                      Hết hạn {new Date(doc.expires_at).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-label-sm rounded-full shrink-0 ${STATUS_STYLES[doc.status]}`}
                >
                  {IDENTITY_STATUS_VI[doc.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
