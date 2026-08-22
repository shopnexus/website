"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The next page, fetched when the reader reaches the end of this one.
 *
 * The feed had a "Tải thêm sản phẩm" button and nothing else, so browsing a marketplace meant a
 * click every twelve cards. This watches a sentinel below the last row instead and fetches as it
 * comes into view.
 *
 * It stops doing that after `autoPages`, on purpose. Endless auto-loading has two costs a
 * shopper actually pays: the footer — help, policies, the seller centre — becomes unreachable,
 * since new rows arrive faster than the scroll can pass them; and a reader who has been through
 * a hundred cards has usually stopped browsing and started scrolling. So the first few pages are
 * free and after that the button comes back, which is also the reader's cue that they have gone
 * a long way.
 *
 * `rootMargin` fires the fetch a screen early, so the next row is usually already there when the
 * reader gets to where it goes.
 */
export default function LoadMore({
  hasNextPage,
  isFetching,
  onLoad,
  autoPages = 3,
  label = "Tải thêm sản phẩm",
}: {
  hasNextPage: boolean;
  isFetching: boolean;
  onLoad: () => void;
  /** How many pages arrive without being asked for. */
  autoPages?: number;
  label?: string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [autoLoaded, setAutoLoaded] = useState(0);
  const auto = autoLoaded < autoPages;

  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasNextPage || !auto) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isFetching) return;
        setAutoLoaded((count) => count + 1);
        onLoad();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
    // isFetching is in the deps so the observer is rebuilt once a fetch settles: an entry that
    // arrived mid-fetch was dropped, and without this a reader who stops scrolling at exactly
    // the sentinel waits for a page nothing will ask for.
  }, [hasNextPage, auto, isFetching, onLoad]);

  if (!hasNextPage) return null;

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <div ref={sentinel} aria-hidden="true" className="h-px w-full" />

      {isFetching ? (
        <span
          className="flex items-center gap-2 font-label-md text-on-surface-variant"
          role="status"
        >
          <span
            className="material-symbols-outlined animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          >
            progress_activity
          </span>
          Đang tải thêm...
        </span>
      ) : (
        // Rendered even while auto-loading is on: it is how a keyboard reader asks for the next
        // page, and scrolling to a sentinel is not something they can do.
        <button
          type="button"
          onClick={onLoad}
          className="rounded-full border-2 border-primary px-10 py-2.5 font-label-md font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
        >
          {label}
        </button>
      )}
    </div>
  );
}
