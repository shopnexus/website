import type { AdminAccount } from "@/api/generated/types.gen";

/**
 * How a row's suspension reads.
 *
 * Two facts hide behind one nullable column and both have to reach the screen: an account
 * is suspended when `status === "suspended"`, and a *null* `suspended_until` on such a row
 * means the suspension never lifts — not "no suspension". Rendering the raw date would
 * make the permanent case an empty cell, which is the reading that gets an account quietly
 * left locked out.
 */
export type SuspensionView =
  | { kind: "active" }
  | { kind: "permanent"; reason: string | null }
  | { kind: "until"; until: Date; expired: boolean; reason: string | null };

export function describeSuspension(account: AdminAccount, now: Date = new Date()): SuspensionView {
  if (account.status !== "suspended") return { kind: "active" };
  if (account.suspended_until === null) {
    return { kind: "permanent", reason: account.suspension_reason };
  }
  const until = new Date(account.suspended_until);
  return {
    kind: "until",
    until,
    // The row is only cleared when something reads it, so a deadline in the past is a
    // real state a moderator sees: still flagged, no longer in force.
    expired: until.getTime() <= now.getTime(),
    reason: account.suspension_reason,
  };
}

export function formatDateTime(value: Date): string {
  return value.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

/**
 * A `<input type="datetime-local">` value is wall-clock time with no zone; the API wants
 * RFC 3339. `new Date(v)` reads it in the browser's zone, which is the zone the moderator
 * typed it in, so the conversion is the right one rather than a guess.
 *
 * An empty box is a permanent suspension, spelled by omitting the field entirely.
 */
export function toUntilIso(localValue: string): string | undefined {
  if (!localValue) return undefined;
  const parsed = new Date(localValue);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

/** The earliest deadline the picker accepts: a suspension that ends in the past is not one. */
export function nowLocalInputValue(now: Date = new Date()): string {
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}
