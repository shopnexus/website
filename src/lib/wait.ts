/**
 * How long something has been waiting on a person, and how loudly to say so.
 *
 * Lives here rather than inside the ticket queue that first needed it, because every staff
 * queue is oldest-first and every one of them answers the same question: is this old? The
 * overview page compares four queues by exactly that, and it cannot reach into one queue's
 * `_lib` to ask.
 */

export type WaitTone = "fresh" | "aging" | "stale";

export interface Wait {
  label: string;
  tone: WaitTone;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The wait, in the units a person answers in.
 *
 * The tone is what turns a sorted list into a worklist. A day is when a requester starts
 * asking again; three is when they stop.
 */
export function waitSince(createdAt: string, now: number): Wait {
  const elapsed = Math.max(0, now - new Date(createdAt).getTime());
  const days = Math.floor(elapsed / DAY);
  const hours = Math.floor((elapsed % DAY) / HOUR);

  let label: string;
  if (days > 0) label = hours > 0 ? `${days}n ${hours}g` : `${days}n`;
  else if (hours > 0) label = `${hours}g`;
  else label = `${Math.max(1, Math.floor(elapsed / MINUTE))}p`;

  if (days >= 3) return { label, tone: "stale" };
  if (days >= 1) return { label, tone: "aging" };
  return { label, tone: "fresh" };
}

/** The gutter's colour, keyed on the tone rather than recomputed per component. */
export const WAIT_TONE_STYLES: Record<WaitTone, string> = {
  fresh: "bg-surface-container-high text-on-surface-variant",
  aging: "bg-tertiary-container text-on-tertiary-container",
  stale: "bg-error-container text-on-error-container",
};

/** The oldest of a set of rows, which is the one number an overview card leads with. */
export function longestWait<T>(
  rows: ReadonlyArray<T>,
  createdAt: (row: T) => string,
  now: number,
): Wait | null {
  let oldest: string | null = null;
  for (const row of rows) {
    const at = createdAt(row);
    if (oldest === null || new Date(at).getTime() < new Date(oldest).getTime()) oldest = at;
  }
  return oldest === null ? null : waitSince(oldest, now);
}
