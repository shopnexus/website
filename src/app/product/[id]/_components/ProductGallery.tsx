"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ImageViewerModal from "@/components/ui/ImageViewerModal";
import type { Resource } from "@/api/generated/types.gen";

/**
 * The photos, at the size somebody deciding on used goods needs them.
 *
 * The previous gallery was a picture and a strip of thumbnails: no way to step through it,
 * no way to see how many there were, and no way to look closely — which on a listing whose
 * whole claim is "this is the condition it is in" is the control that matters most. Full
 * size is `ImageViewerModal`, which the chat attachments already open.
 *
 * The picked photo is held by index rather than by id so stepping past either end wraps, and
 * a variant switch that hands over a shorter gallery falls back to its first photo instead
 * of rendering nothing.
 */
export default function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: readonly Resource[];
  alt: string;
  /** Rendered over the top-left corner — the condition, which is a claim about the photo. */
  badge?: React.ReactNode;
}) {
  const [picked, setPicked] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const strip = useRef<HTMLDivElement>(null);

  const count = images.length;
  const index = count > 0 ? Math.min(picked, count - 1) : 0;
  const main = images[index];

  const step = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setPicked((current) => (Math.min(current, count - 1) + delta + count) % count);
    },
    [count],
  );

  // The arrows work while the gallery holds focus, so a reader stepping through photos with
  // the keyboard is not tabbing across every thumbnail to reach the next one.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  };

  // Keep the active thumbnail in view when the arrows moved the selection rather than a click.
  useEffect(() => {
    const active = strip.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [index]);

  if (!main) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-outline-variant bg-surface-container">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl" aria-hidden="true">
            image
          </span>
          <span className="font-body-sm">Tin đăng này chưa có ảnh</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      onKeyDown={onKeyDown}
      role="group"
      aria-label="Ảnh sản phẩm"
    >
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-outline-variant bg-surface">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          aria-label="Xem ảnh cỡ lớn"
        >
          <Image
            src={main.url || ""}
            alt={alt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 440px, 100vw"
            priority
          />
        </button>

        {badge && <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">{badge}</div>}

        {count > 1 && (
          <>
            <GalleryArrow direction="prev" onClick={() => step(-1)} />
            <GalleryArrow direction="next" onClick={() => step(1)} />
            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/55 px-2.5 py-1 font-label-sm tabular-nums text-white backdrop-blur-sm">
              {index + 1}/{count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div ref={strip} className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              data-index={position}
              onClick={() => setPicked(position)}
              aria-label={`Ảnh ${position + 1}`}
              aria-current={position === index}
              className={[
                "relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                position === index
                  ? "border-primary"
                  : "border-transparent hover:border-outline-variant",
              ].join(" ")}
            >
              <Image src={image.url || ""} alt="" fill className="object-cover" sizes="68px" />
            </button>
          ))}
        </div>
      )}

      {/* Indexed against the same array the strip is, so stepping inside the viewer moves
          the gallery underneath it rather than losing the reader's place on close. */}
      <ImageViewerModal
        images={images.map((image) => image.url ?? "")}
        index={zoomed ? index : null}
        onIndexChange={setPicked}
        onClose={() => setZoomed(false)}
        altText={alt}
      />
    </div>
  );
}

/** Shown on hover and whenever the gallery has keyboard focus — never hover-only. */
function GalleryArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Ảnh trước" : "Ảnh sau"}
      className={[
        "absolute top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full",
        "bg-surface/90 text-on-surface shadow-sm backdrop-blur-sm transition-opacity",
        "opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isPrev ? "left-3" : "right-3",
      ].join(" ")}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {isPrev ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );
}
