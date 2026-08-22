"use client";

import type { ReactNode } from "react";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "./EmptyState";
import LoadMore from "./LoadMore";
import Panel from "./Panel";

/**
 * The list every staff queue is worked from: a header saying how much there is, the rows,
 * and the way to the next page.
 *
 * The four queues had arrived at four of these. Two drew rows inside a bordered panel with
 * a header, two floated separate cards down the page; two waited behind a spinning icon,
 * two behind skeletons; all four wrote their own empty state, and one of the two panels was
 * `surface-container-low` with `outline-variant/40` borders while every other surface on
 * the admin side is `surface-container-lowest` with solid ones. None of that was a decision
 * anybody made — it is what four pages written on four days look like.
 *
 * Rows-in-a-panel won over floating cards because a queue is read down a column: the
 * dividers line the fields up, and the gaps between cards were buying whitespace on the
 * one surface that is nothing but long lists.
 */
export default function QueuePanel({
  heading,
  count,
  countNoun,
  filters,
  isLoading,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyHint,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  children,
}: {
  heading: string;
  /** Null where the read is cursor-paginated and the server never counts the rest. */
  count?: number | null;
  countNoun: string;
  /** Anything narrowing the list that is not its status — status is the strip above. */
  filters?: ReactNode;
  isLoading: boolean;
  isEmpty: boolean;
  emptyIcon: string;
  emptyTitle: string;
  emptyHint?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  children: ReactNode;
}) {
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-outline-variant px-3 py-2.5 sm:px-4">
        <div className="mr-auto flex min-w-0 items-baseline gap-2">
          <h2 className="font-label-lg font-bold text-on-surface">{heading}</h2>
          {count !== null && count !== undefined && (
            <span className="font-label-sm tabular-nums text-on-surface-variant">
              {count} {countNoun}
            </span>
          )}
        </div>
        {filters}
      </div>

      {isLoading ? (
        // Six at the height of a real row, not four at 80px: a skeleton that is taller than
        // what replaces it makes the list jump upward as it loads.
        <div className="flex flex-col gap-2 p-3 sm:p-4" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} hint={emptyHint} />
      ) : (
        <ul className="divide-y divide-outline-variant">{children}</ul>
      )}

      {hasNextPage && (
        <div className="border-t border-outline-variant px-4 py-3">
          <LoadMore isFetching={isFetchingNextPage} onClick={onLoadMore} />
        </div>
      )}
    </Panel>
  );
}
