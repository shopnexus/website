import { WAIT_TONE_STYLES, type Wait } from "@/lib/wait";

/**
 * How long this case has waited, in the left gutter of every queue row.
 *
 * The signature of this surface: every staff queue is oldest-first, so the wait is the fact
 * that orders the work, and it reads as a ruler down the left edge rather than as a
 * timestamp somebody has to subtract. Tabular figures so the column stays a column.
 *
 * Shared rather than owned by the ticket queue that first drew it — the overview compares
 * four queues by exactly this number, and the withdrawal and verification desks are
 * oldest-first for the same reason tickets are.
 */
export default function WaitGutter({ wait }: { wait: Wait }) {
  return (
    <div
      className={[
        "w-14 shrink-0 flex flex-col items-center justify-center self-stretch rounded-xl",
        "font-label-sm tabular-nums tracking-tight py-2",
        WAIT_TONE_STYLES[wait.tone],
      ].join(" ")}
      title="Thời gian chờ xử lý"
    >
      <span className="text-[15px] font-bold leading-none">{wait.label}</span>
      <span className="text-[9px] uppercase tracking-[0.1em] mt-1 opacity-70">chờ</span>
    </div>
  );
}
