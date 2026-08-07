"use client";

import { useState } from "react";
import ImageViewerModal from "@/components/ui/ImageViewerModal";
import type { IdentityScans } from "@/api/generated/types.gen";

/** Labelled, because a back and a selfie are different evidence. */
const SLOTS = [
  { key: "front", label: "Mặt trước" },
  { key: "back", label: "Mặt sau" },
  { key: "selfie", label: "Ảnh chân dung" },
] as const;

/**
 * The scans the vendor read.
 *
 * A moderator overruling an automated verdict is deciding whether somebody gets paid, and
 * until the server kept these there was nothing on the screen to decide on. Each is
 * labelled and opens full-size: an ID photographed at an angle is unreadable at 96px, and
 * the thing being checked is whether the face and the document agree.
 *
 * A missing one is stated rather than hidden — "no back" is true of a passport, but a
 * front that failed to resolve is a reason not to decide yet, and the two must not look
 * alike.
 */
export default function ScanStrip({ scans }: { scans: IdentityScans }) {
  const [viewing, setViewing] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-label-sm text-on-surface-variant">Ảnh giấy tờ</span>
      <div className="flex flex-wrap gap-3">
        {SLOTS.map(({ key, label }) => {
          const scan = scans[key];
          return (
            <div key={key} className="flex flex-col gap-1">
              {scan?.url ? (
                <button
                  type="button"
                  onClick={() => setViewing(scan.url)}
                  aria-label={`Xem ${label} cỡ lớn`}
                  className="w-28 h-20 rounded-lg overflow-hidden border border-outline-variant bg-surface-container cursor-pointer hover:border-primary transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- signed URL, expires */}
                  <img src={scan.url} alt={label} className="w-full h-full object-cover" />
                </button>
              ) : (
                <div className="w-28 h-20 rounded-lg border border-dashed border-outline-variant bg-surface-container flex items-center justify-center text-center px-2">
                  <span className="font-label-sm text-on-surface-variant">
                    {key === "back" ? "Không có mặt sau" : "Không có ảnh"}
                  </span>
                </div>
              )}
              <span className="font-label-sm text-on-surface-variant">{label}</span>
            </div>
          );
        })}
      </div>

      <ImageViewerModal
        isOpen={viewing !== null}
        imageUrl={viewing ?? ""}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
