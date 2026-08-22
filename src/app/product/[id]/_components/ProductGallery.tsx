"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ImageViewerModal from "@/components/ui/ImageViewerModal";
import type { Resource } from "@/api/generated/types.gen";

/**
 * The photos, at the size somebody deciding on used goods needs them — and no larger.
 *
 * The previous version was a 4:5 frame at the full width of its column: 520 wide, 650 tall,
 * most of a laptop's first screen for one picture, with a horizontal thumbnail strip adding
 * another 68px under it. On a phone it pushed the title of the listing below the fold. The
 * frame is square now and the strip stands up as a rail beside it, so the whole block is
 * about as tall as it is wide and the price sits next to the photo rather than under it.
 *
 * `object-contain` on a plain ground, not `cover`. Cover crops to the frame, and on a
 * marketplace for used things the crop lands on exactly what the buyer came to see: the edge
 * of the case, the corner of the screen, the scuff the seller photographed on purpose.
 *
 * One track for every width rather than a desktop carousel and a mobile one. It is a
 * scroll-snap row, so a phone swipes it natively and the arrows on a desktop scroll the same
 * element; there is no second copy of the images in the DOM and no carousel library between
 * the reader and a picture.
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
  const track = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  const count = images.length;
  const index = count > 0 ? Math.min(picked, count - 1) : 0;

  /**
   * Move the track, and let the scroll handler be what updates `picked`.
   *
   * Setting the state here as well would fight the handler on every frame of a smooth
   * scroll: the position is the truth, and it is already being read.
   */
  const scrollTo = useCallback((target: number, smooth = true) => {
    const element = track.current;
    if (!element) return;
    element.scrollTo({
      left: target * element.clientWidth,
      behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
    });
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (count < 2) return;
      scrollTo((index + delta + count) % count);
    },
    [count, index, scrollTo],
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

  const onScroll = () => {
    const element = track.current;
    if (!element || element.clientWidth === 0) return;
    setPicked(Math.round(element.scrollLeft / element.clientWidth));
  };

  // Keep the active thumbnail in view when a swipe or an arrow moved the selection.
  useEffect(() => {
    const active = rail.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [index]);

  if (count === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl" aria-hidden="true">
          image
        </span>
        <span className="font-body-sm">Tin đăng này chưa có ảnh</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3" onKeyDown={onKeyDown} role="group" aria-label="Ảnh sản phẩm">
      {/* Upright beside the photo rather than lying under it. Same thumbnails, none of the
          vertical space — and it caps its own height, so a listing with twenty photos does
          not make the rail taller than the picture it belongs to. */}
      {count > 1 && (
        <div
          ref={rail}
          className="hide-scrollbar hidden max-h-[440px] shrink-0 flex-col gap-2 overflow-y-auto lg:flex"
        >
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              data-index={position}
              onClick={() => scrollTo(position)}
              aria-label={`Ảnh ${position + 1}`}
              aria-current={position === index}
              className={[
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-container-low transition-colors",
                position === index
                  ? "border-primary"
                  : "border-transparent hover:border-outline-variant",
              ].join(" ")}
            >
              <Image
                src={image.url || ""}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}

      <div className="group relative min-w-0 flex-1">
        <div
          ref={track}
          onScroll={onScroll}
          className="hide-scrollbar flex aspect-square w-full snap-x snap-mandatory overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container-low"
        >
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setZoomed(true)}
              className="relative h-full w-full shrink-0 cursor-zoom-in snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              aria-label="Xem ảnh cỡ lớn"
              tabIndex={position === index ? 0 : -1}
            >
              <Image
                src={image.url || ""}
                alt={position === index ? alt : ""}
                fill
                className="object-contain"
                sizes="(min-width: 1280px) 360px, (min-width: 1024px) 320px, 100vw"
                priority={position === 0}
              />
            </button>
          ))}
        </div>

        {badge && (
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
            {badge}
          </div>
        )}

        {count > 1 && (
          <>
            <GalleryArrow direction="prev" onClick={() => step(-1)} />
            <GalleryArrow direction="next" onClick={() => step(1)} />
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-0.5 font-label-sm tabular-nums text-white backdrop-blur-sm">
              {index + 1}/{count}
            </span>
            {/* The rail is the position indicator on a desktop; a phone has no rail, so the
                dots are what say a swipe will find more. */}
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">
              {images.map((image, position) => (
                <span
                  key={image.id}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    position === index ? "w-4 bg-primary" : "w-1.5 bg-on-surface-variant/40",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        )}

        {/* Indexed against the same array the track is, so stepping inside the viewer moves
            the gallery underneath it rather than losing the reader's place on close. */}
        <ImageViewerModal
          images={images.map((image) => image.url ?? "")}
          index={zoomed ? index : null}
          onIndexChange={(next) => scrollTo(next, false)}
          onClose={() => setZoomed(false)}
          altText={alt}
        />
      </div>
    </div>
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
        "absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full lg:grid",
        "bg-surface/90 text-on-surface shadow-sm backdrop-blur-sm transition-opacity",
        "opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isPrev ? "left-2" : "right-2",
      ].join(" ")}
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
        {isPrev ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );
}
