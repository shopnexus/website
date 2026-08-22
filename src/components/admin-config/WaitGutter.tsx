import { WAIT_TONE_STYLES, type Wait } from "@/lib/wait";

/**
 * How long this case has waited, in the left gutter of every queue row.
 *
 * The signature of this surface: every staff queue is oldest-first, so the wait is the fact
 * that orders the work, and it reads as a ruler down the left edge rather than as a
 * timestamp somebody has to subtract. Mono and tabular so the column stays a column.
 *
 * One line, not two. It was a 56px block with the value at title size over the word "chờ",
 * which made the oldest thing about a row the largest thing in it and set the row's height on
 * its own. The tooltip says "Đã chờ 2n 22g", so the word is not lost — it is just not repeated
 * on every row of a column that is entirely waits.
 *
 * Shared rather than owned by the ticket queue that first drew it — the overview compares
 * four queues by exactly this number, and the withdrawal and verification desks are
 * oldest-first for the same reason tickets are.
 */
export default function WaitGutter({ wait }: { wait: Wait }) {
  return (
    <div
      className={[
        "grid w-12 shrink-0 place-items-center self-stretch rounded-lg py-1",
        "font-mono text-[13px] font-bold tabular-nums tracking-tight",
        WAIT_TONE_STYLES[wait.tone],
      ].join(" ")}
      title={`Đã chờ ${wait.label}`}
    >
      {wait.label}
    </div>
  );
}
