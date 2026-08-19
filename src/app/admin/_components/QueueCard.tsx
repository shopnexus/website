"use client";

import Link from "next/link";
import Panel from "@/components/admin-config/Panel";
import Skeleton from "@/components/ui/Skeleton";
import { WAIT_TONE_STYLES, type Wait } from "@/lib/wait";

/** One row's worth of preview: what it is, and who it belongs to. */
export interface Peek {
  id: string;
  title: string;
  detail: string;
}

/**
 * One queue, as much of it as fits on a card.
 *
 * The card leads with the longest wait rather than the count, because the count says how
 * much work there is and the wait says whether any of it has gone wrong. Three rows behind
 * it, oldest first, so a moderator can tell from the overview whether a queue needs them
 * now or needs them later — which is the whole reason this page replaced a `redirect()`.
 *
 * `count` is null on the ticket queue and only there: it is the one cursor-paginated read,
 * and a cursor page carries no total. The card says nothing rather than reporting the three
 * rows it asked for as if that were all of them.
 */
export default function QueueCard({
  href,
  icon,
  name,
  count,
  countNoun,
  wait,
  peeks,
  isLoading,
  emptyLine,
}: {
  href: string;
  icon: string;
  name: string;
  count: number | null;
  countNoun: string;
  wait: Wait | null;
  peeks: ReadonlyArray<Peek>;
  isLoading: boolean;
  emptyLine: string;
}) {
  const clear = !isLoading && peeks.length === 0;

  return (
    <Panel className="flex flex-col">
      <div className="px-5 py-4 flex items-start gap-3 border-b border-outline-variant">
        <span
          className="material-symbols-outlined text-[22px] text-primary shrink-0 mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0 mr-auto">
          <h2 className="font-headline-sm text-on-surface truncate">{name}</h2>
          {isLoading ? (
            <Skeleton className="h-4 w-24 mt-1.5" />
          ) : (
            <p className="font-body-sm text-on-surface-variant tabular-nums">
              {clear ? emptyLine : count !== null ? `${count} ${countNoun}` : "đang chờ xử lý"}
            </p>
          )}
        </div>

        {/* The same gutter the queues themselves use, so the number means the same thing in
            both places. Hidden while empty: there is no wait to report. */}
        {!isLoading && wait && (
          <div
            className={[
              "shrink-0 px-3 py-2 rounded-xl font-label-sm tabular-nums text-center",
              WAIT_TONE_STYLES[wait.tone],
            ].join(" ")}
            title="Đã chờ lâu nhất"
          >
            <span className="text-[15px] font-bold leading-none block">{wait.label}</span>
            <span className="text-[9px] uppercase tracking-[0.1em] opacity-70">chờ lâu nhất</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-5 flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : clear ? (
        <div className="px-5 py-8 flex items-center justify-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-body-sm">Không còn việc</span>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant">
          {peeks.map((peek) => (
            <li key={peek.id} className="px-5 py-2.5 min-w-0">
              <p className="font-body-sm text-on-surface truncate">{peek.title}</p>
              <p className="font-label-sm text-on-surface-variant truncate">{peek.detail}</p>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={href}
        className="mt-auto px-5 py-3.5 border-t border-outline-variant flex items-center gap-1.5 font-label-md text-primary hover:bg-primary/5 transition-colors"
      >
        Mở hàng đợi
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </Link>
    </Panel>
  );
}
