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
      <div className="px-4 sm:px-5 py-4 border-b border-outline-variant flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="mr-auto flex items-baseline gap-2.5 min-w-0">
          <h2 className="font-headline-sm text-on-surface">{heading}</h2>
          {count !== null && count !== undefined && (
            <span className="font-body-sm text-on-surface-variant tabular-nums">
              {count} {countNoun}
            </span>
          )}
        </div>
        {filters}
      </div>

      {isLoading ? (
        <div className="p-4 sm:p-5 flex flex-col gap-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} hint={emptyHint} />
      ) : (
        <ul className="divide-y divide-outline-variant">{children}</ul>
      )}

      {hasNextPage && (
        <div className="px-5 py-4 border-t border-outline-variant">
          <LoadMore isFetching={isFetchingNextPage} onClick={onLoadMore} />
        </div>
      )}
    </Panel>
  );
}
