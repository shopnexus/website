"use client";

import type { AdminIdentityDocument } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { IDENTITY_DOCUMENT_TYPE_VI, IDENTITY_STATUS_VI } from "@/lib/dictionaries";
import { STATUS_CHIP, STATUS_RAIL, isExpired, needsExpiry } from "../_lib/identity.logic";

/**
 * One case in the queue.
 *
 * There is no document number and no scan on this screen because the platform stores
 * neither — the vendor performs the check and only its verdict is kept. So what a
 * moderator is given is the subject, the type, and which vendor answered; anything that
 * looked like a document number here would be invented.
 */
export default function IdentityCard({
  entry,
  onDecide,
}: {
  entry: AdminIdentityDocument;
  onDecide: (entry: AdminIdentityDocument) => void;
}) {
  const { account, document } = entry;
  const expired = isExpired(document);

  return (
    <li className="flex">
      <span className={`w-1 shrink-0 ${STATUS_RAIL[document.status]}`} aria-hidden />

      <div className="flex-1 min-w-0 p-5 flex flex-wrap items-start gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-headline font-bold text-lg text-on-surface">{account.name}</span>
            <span
              className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${STATUS_CHIP[document.status]}`}
            >
              {IDENTITY_STATUS_VI[document.status]}
            </span>
            {expired && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-error-container text-on-error-container">
                Đã quá hạn
              </span>
            )}
          </div>

          <div className="font-body-sm text-on-surface mt-2">
            {IDENTITY_DOCUMENT_TYPE_VI[document.doc_type]}
            <span className="mx-2 text-outline">·</span>
            {/* The vendor is the provenance of the verdict: a check FPT.AI answered and one a
                moderator typed are different evidence, and only this field tells them apart. */}
            Nhà cung cấp: <span className="font-mono text-[13px]">{document.provider}</span>
          </div>

          <div className="font-body-sm text-on-surface-variant mt-1">
            Gửi {new Date(document.created_at).toLocaleString("vi-VN")}
            {document.verified_at &&
              ` · Duyệt ${new Date(document.verified_at).toLocaleDateString("vi-VN")}`}
            {document.expires_at
              ? ` · Hết hạn ${new Date(document.expires_at).toLocaleDateString("vi-VN")}`
              : needsExpiry(document.doc_type)
                ? " · Chưa ghi ngày hết hạn"
                : ""}
          </div>

          <div className="font-mono text-[11px] text-on-surface-variant mt-1">
            {account.id} · {document.id}
          </div>

          {document.rejection_reason && (
            <p className="font-body-sm text-on-surface mt-3 bg-surface-container-high rounded-lg p-3">
              {document.rejection_reason}
            </p>
          )}
        </div>

        {document.status === "pending" && (
          <Button variant="primary" size="sm" onClick={() => onDecide(entry)} className="shrink-0">
            Ra kết luận
          </Button>
        )}
      </div>
    </li>
  );
}
