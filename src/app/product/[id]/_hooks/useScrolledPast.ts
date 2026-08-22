"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Whether the anchor has left the viewport upwards.
 *
 * Upwards specifically: an anchor below the fold on first paint is also "not intersecting",
 * and something that appeared before the reader had ever seen the real controls would be
 * standing in for an interface they have not met yet.
 *
 * It lives here rather than inside the bottom bar because two things now depend on the same
 * answer — the bar itself, and the chat button that has to sit above it — and two observers
 * watching one element is how they end up disagreeing for a frame.
 */
export function useScrolledPast(anchor: RefObject<HTMLElement | null>): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const element = anchor.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [anchor]);

  return past;
}
