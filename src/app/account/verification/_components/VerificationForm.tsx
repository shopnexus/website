"use client";

import type { IdentityDocumentType } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { IDENTITY_DOCUMENT_TYPE_VI } from "@/lib/dictionaries";
import { useVerificationForm } from "../_hooks/useVerificationForm";
import { needsBackScan } from "../_lib/kyc.logic";
import ScanUploader from "./ScanUploader";

const DOC_TYPES: IdentityDocumentType[] = ["national-id", "passport", "driver-license"];

/**
 * Submitting a document for verification.
 *
 * Three photos and a type, which is exactly what `POST /identity-documents` takes. The
 * back scan disappears for a passport rather than being marked optional: a field that
 * cannot apply is not a field the seller should have to reason about.
 */
export default function VerificationForm({ onDone }: { onDone: () => void }) {
  const { docType, setDocType, scans, pick, uploading, missing, submit, isSubmitting } =
    useVerificationForm(onDone);

  return (
    <div className="space-y-6">
      <div>
        <span className="block text-label-md text-on-surface mb-2">Loại giấy tờ</span>
        <div className="flex flex-wrap gap-2">
          {DOC_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={docType === type}
              onClick={() => setDocType(type)}
              className={[
                "px-4 py-2 rounded-full border text-label-md transition-all cursor-pointer",
                docType === type
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
              ].join(" ")}
            >
              {IDENTITY_DOCUMENT_TYPE_VI[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScanUploader
          id="scan-front"
          label="Mặt trước"
          hint={
            docType === "passport"
              ? "Trang có ảnh và thông tin cá nhân."
              : "Mặt có ảnh, chụp rõ bốn góc, không loá."
          }
          previewUrl={scans.front?.previewUrl}
          uploading={uploading === "front"}
          onPick={(file) => pick("front", file)}
        />

        {needsBackScan(docType) && (
          <ScanUploader
            id="scan-back"
            label="Mặt sau"
            hint="Mặt còn lại của giấy tờ."
            previewUrl={scans.back?.previewUrl}
            uploading={uploading === "back"}
            onPick={(file) => pick("back", file)}
          />
        )}

        <ScanUploader
          id="scan-selfie"
          label="Ảnh chân dung"
          hint="Ảnh chụp trực tiếp khuôn mặt bạn, để đối chiếu với ảnh trên giấy tờ."
          previewUrl={scans.selfie?.previewUrl}
          uploading={uploading === "selfie"}
          onPick={(file) => pick("selfie", file)}
        />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Button
          disabled={missing.length > 0 || uploading !== null || isSubmitting}
          onClick={submit}
        >
          {isSubmitting ? "Đang gửi..." : "Gửi giấy tờ xác minh"}
        </Button>
        {missing.length > 0 && (
          <span className="text-body-sm text-on-surface-variant">
            Còn thiếu {missing.length} ảnh.
          </span>
        )}
      </div>
    </div>
  );
}
