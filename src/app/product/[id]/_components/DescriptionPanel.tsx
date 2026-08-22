"use client";

import { useEffect, useRef, useState } from "react";

/**
 * What the seller wrote, at full width and without a scroll trap.
 *
 * A used-goods description is where the honest sellers put the scratches, so it is not
 * truncated by default — it is measured, and only a description tall enough to bury the rest
 * of the page gets the fade and the toggle. Measured rather than guessed from the character
 * count, because a listing whose description is one long paragraph and one whose description
 * is forty short lines have nothing in common at the same length.
 */
const COLLAPSED_HEIGHT = 320;

export default function DescriptionPanel({ description }: { description: string }) {
  const body = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const element = body.current;
    if (!element) return;
    const measure = () => setOverflows(element.scrollHeight > COLLAPSED_HEIGHT + 24);
    measure();
    // Re-measured on resize: the same text is four lines wide and eleven lines narrow.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [description]);

  const clipped = overflows && !expanded;

  return (
    <section id="description" className="scroll-mt-32">
      <h2 className="font-headline-sm font-bold text-on-surface">Mô tả từ người bán</h2>
      <div className="relative mt-4 rounded-3xl border border-outline-variant bg-surface p-5 sm:p-6">
        <div
          ref={body}
          style={clipped ? { maxHeight: COLLAPSED_HEIGHT, overflow: "hidden" } : undefined}
          className="whitespace-pre-wrap font-body-md leading-relaxed text-on-surface"
        >
          {description.trim() === "" ? (
            <span className="text-on-surface-variant">Người bán chưa viết mô tả cho tin này.</span>
          ) : (
            description
          )}
        </div>

        {clipped && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-3xl bg-gradient-to-t from-surface to-transparent"
            aria-hidden="true"
          />
        )}

        {overflows && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            className="relative mt-4 inline-flex items-center gap-1 font-label-md font-bold text-primary hover:underline"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {expanded ? "expand_less" : "expand_more"}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
