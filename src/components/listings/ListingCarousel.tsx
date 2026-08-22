"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import ProductCard, { type ProductCardItem } from "@/components/ui/ProductCard";

/**
 * A row of listings you scroll sideways, under a heading that says why the row exists.
 *
 * A rail rather than a grid, and the difference is editorial: a grid says "here is the
 * catalogue" and gets read as one undifferentiated wall, while a row says "here is one idea,
 * and there are more ideas below it". Several short rows, each with its own reason, is how a
 * reader can skip what is not for them — which a 4×N grid of everything never lets them do.
 *
 * The dragging is Embla's, after a hand-rolled version that worked and did not feel like
 * anything: native `scroll-snap` plus a pointermove handler gives a row that tracks the cursor
 * 1:1 and then stops dead on release, and everything that makes a carousel feel physical —
 * momentum, a flick that carries, a rubber band at the ends — is a reimplementation of a solved
 * problem. Embla animates a transform rather than `scrollLeft`, so the drag runs on the
 * compositor, and it already gets the two details that are easy to get wrong: a flick advances
 * by whole cards, and the click that follows a drag is suppressed — without which a card-sized
 * link navigates every time the reader meant to scroll.
 *
 * That transform is also what has to be paid for. A native `overflow-x` scroller gets four input
 * methods from the browser for nothing — a trackpad's two-finger swipe, shift+wheel, the arrow
 * keys once it holds focus, and touch — and moving to a transform silently dropped the first
 * three. So they are put back explicitly: WheelGesturesPlugin for the trackpad and the wheel,
 * a keydown handler for the arrow keys. A rail that only answers a click-and-drag is a rail that
 * does not move for most people using a laptop.
 */
export default function ListingCarousel({
  title,
  listings,
  moreHref,
  moreLabel = "Xem tất cả",
  source,
  className = "",
}: {
  title: React.ReactNode;
  listings: readonly ProductCardItem[];
  moreHref?: string;
  moreLabel?: string;
  /** Passed to each card so a click from this surface is recorded as such. */
  source?: "search" | "recommended" | "category";
  className?: string;
}) {
  const [emblaRef, embla] = useEmblaCarousel(
    {
      align: "start",
      // The row goes where it is pushed and glides to a stop — no snapping back, no rounding to
      // the nearest card. Snapping was tried twice and both settings are worse to *use*: by
      // group (`slidesToScroll: "auto"`) a drag of a card and a half springs all the way back to
      // where it started, and by card it still yanks the row out of the reader's hand at the end
      // of every flick. Free dragging is what a rail of browsable things should do — a flick
      // carries, and the row rests wherever the flick ran out.
      dragFree: true,
      // Still one card per snap, which is what the arrows step through: `jump` advances by a
      // screenful of them. Snaps with dragFree are targets for a press, not a magnet for a drag.
      slidesToScroll: 1,
      // No loop: a rail of listings has an end, and a reader who reaches it should be able to
      // tell, rather than being carried back to the first card as though there were more.
      containScroll: "trimSnaps",
    },
    // `forceWheelAxis: "x"` so a horizontal trackpad swipe moves the row while a vertical one
    // still scrolls the page — without it the plugin claims whichever axis the gesture leans on
    // and the page stops scrolling over a rail.
    [WheelGesturesPlugin({ forceWheelAxis: "x" })],
  );
  // Whether either arrow has anywhere to go is Embla's state, not this component's, so it is
  // subscribed to rather than mirrored into a useState — which would mean setting state from an
  // effect on every mount just to catch up with what the carousel already knew. `reInit` and
  // `resize` are in the subscription because both change where "the end" is without anybody
  // scrolling: a window resize, and a shelf whose cards arrive after the first paint.
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!embla) return () => {};
      embla.on("select", onChange).on("reInit", onChange).on("resize", onChange);
      return () => {
        embla.off("select", onChange).off("reInit", onChange).off("resize", onChange);
      };
    },
    [embla],
  );
  const atStart = useSyncExternalStore(subscribe, () => !embla?.canScrollPrev(), () => true);
  const atEnd = useSyncExternalStore(subscribe, () => !embla?.canScrollNext(), () => true);

  /**
   * An arrow moves a screenful, not a card.
   *
   * The snapping is per card so that dragging behaves (see above), but a *press* wants a page:
   * clicking "next" four times to see the next four cards is the interaction a rail exists to
   * avoid. So the arrow scrolls by however many cards are currently in view — Embla clamps the
   * target, so the last press lands on the end rather than off it.
   */
  const jump = (direction: -1 | 1) => {
    if (!embla) return;
    const step = Math.max(1, embla.slidesInView().length);
    embla.scrollTo(embla.selectedScrollSnap() + direction * step);
  };

  /**
   * Text selection is the other thing a drag competes with. Dragging across a row of cards makes
   * the browser select their titles and prices, so a flick ends with the reader holding a blue
   * smear of somebody else's product name — and on the next drag, dragging *text* rather than
   * the row.
   *
   * Toggled on the node rather than through React state: a re-render between the press and the
   * class landing is a frame in which the browser has already begun selecting. The existing
   * selection is cleared too, since a drag that starts inside one extends it instead of starting
   * over. Scoped to the drag rather than left on permanently because that is the only moment it
   * is needed — not because it would cost a reader the ability to copy a card's title, which the
   * card being one big link already costs them: the first click of a double-click navigates.
   */
  useEffect(() => {
    if (!embla) return;
    const root = embla.rootNode();
    const down = () => {
      root.classList.add("select-none");
      window.getSelection()?.removeAllRanges();
    };
    const up = () => root.classList.remove("select-none");
    embla.on("pointerDown", down).on("pointerUp", up);
    return () => {
      embla.off("pointerDown", down).off("pointerUp", up);
    };
  }, [embla]);

  if (listings.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="min-w-0 font-headline-sm font-bold text-on-surface">{title}</h2>

        <div className="flex shrink-0 items-center gap-2">
          {moreHref && (
            <Link
              href={moreHref}
              className="font-label-md font-bold text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
            >
              {moreLabel}
            </Link>
          )}
          {/* For the pointer that cannot flick, and for the keyboard: an affordance that only
              appears on hover is one a keyboard does not have. */}
          <div className="hidden items-center gap-1 sm:flex">
            <Arrow direction="prev" disabled={atStart} onClick={() => jump(-1)} />
            <Arrow direction="next" disabled={atEnd} onClick={() => jump(1)} />
          </div>
        </div>
      </div>

      {/* Focusable and keyed: a native overflow scroller answers the arrow keys once it holds
          focus, and nothing else here would. `group` is the whole rail, so the ring reads as one
          control rather than as a box around the cards. */}
      <div
        ref={emblaRef}
        tabIndex={0}
        role="group"
        aria-label="Danh sách sản phẩm, dùng mũi tên trái phải để xem thêm"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            jump(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            jump(1);
          }
        }}
        className="cursor-grab overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing"
      >
        {/* touch-pan-y so a vertical swipe still scrolls the page: the row owns the horizontal
            axis and nothing else. The negative margin plus per-slide padding is the gutter —
            a `gap` would be counted into Embla's slide measurements. */}
        <ul className="-ml-4 flex touch-pan-y">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="min-w-0 shrink-0 grow-0 basis-1/2 pl-4 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <ProductCard product={listing} source={source} className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Xem các sản phẩm trước" : "Xem thêm sản phẩm"}
      className="grid h-9 w-9 place-items-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-35"
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
        {isPrev ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );
}
