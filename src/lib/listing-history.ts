import type { ListingHistoryEntry } from "@/api/generated/types.gen"
import { LISTING_FIELD_VI, LISTING_HISTORY_CODE_VI, LISTING_STATUS_VI } from "@/lib/dictionaries"
import { staffRoleLabel } from "@/lib/staff"

/**
 * Turning one audit row into a line a person reads.
 *
 * The API answers a fact — a code, the fields it touched, and whatever else was recorded —
 * and deliberately not a sentence: the trail is the same for a seller and a moderator, and
 * only the client knows which of them is reading. So the wording is decided here.
 *
 * Every helper degrades rather than throws. `details` is a free-form object by contract, and
 * a timeline that renders nothing because a key it expected was absent is worse than one
 * that shows the fact without its detail.
 */

/** Who acted, as the timeline names them. A moderator stays a role, never a person. */
export function actorName(entry: ListingHistoryEntry): string {
	if (entry.actor_kind === "system") return "Hệ thống"
	// Staff read the account behind a verdict; a seller reads the role and nothing more,
	// which is the same anonymisation the ticket desk applies.
	if (entry.actor_kind === "staff") return entry.actor?.name || staffRoleLabel("moderator")
	return entry.actor?.name || "Người bán"
}

/** What happened, in the words the reader is owed. */
export function actionLabel(entry: ListingHistoryEntry): string {
	return LISTING_HISTORY_CODE_VI[entry.code] ?? "đã thay đổi tin đăng"
}

/** The fields an edit touched, named the way the form names them. */
export function fieldLabels(entry: ListingHistoryEntry): string[] {
	return entry.fields.map((field) => LISTING_FIELD_VI[field] ?? field)
}

/**
 * The supporting line under an entry: the status it reached, or the words a moderator sent.
 *
 * A takedown reason is only ever here when the moderator chose to send it — the server drops
 * it otherwise — so anything that arrives is the seller's to read.
 */
export function detailNote(entry: ListingHistoryEntry): string {
	const reason = entry.details.reason
	if (typeof reason === "string" && reason) return reason
	const note = entry.details.note
	if (typeof note === "string" && note) return note
	return ""
}

/** The status the listing was left in, when the fact carried one. */
export function statusReached(entry: ListingHistoryEntry): string {
	const status = entry.details.status
	if (typeof status !== "string") return ""
	return LISTING_STATUS_VI[status as keyof typeof LISTING_STATUS_VI] ?? status
}

interface EntryStyle {
	icon: string
	/** Tailwind classes for the dot: the timeline reads as a colour before it reads as words. */
	tone: string
}

const STYLES: Record<string, EntryStyle> = {
	"listing.create": { icon: "add_circle", tone: "bg-surface-container-high text-on-surface-variant" },
	"listing.edit": { icon: "edit", tone: "bg-secondary-container text-on-secondary-container" },
	"listing.edit_submitted": { icon: "pending", tone: "bg-tertiary-container text-on-tertiary-container" },
	"listing.publish": { icon: "send", tone: "bg-tertiary-container text-on-tertiary-container" },
	"listing.approve": { icon: "check_circle", tone: "bg-primary text-on-primary" },
	"listing.takedown": { icon: "block", tone: "bg-error text-on-error" },
	"listing.hide": { icon: "visibility_off", tone: "bg-surface-container-high text-on-surface-variant" },
	"listing.variant_added": { icon: "add_box", tone: "bg-secondary-container text-on-secondary-container" },
	"listing.variant_edited": { icon: "tune", tone: "bg-secondary-container text-on-secondary-container" },
	"listing.variant_removed": { icon: "delete", tone: "bg-surface-container-high text-on-surface-variant" },
	"listing.delete": { icon: "delete_forever", tone: "bg-error text-on-error" },
}

const FALLBACK: EntryStyle = { icon: "history", tone: "bg-surface-container-high text-on-surface-variant" }

export function entryStyle(entry: ListingHistoryEntry): EntryStyle {
	return STYLES[entry.code] ?? FALLBACK
}

/** The clock time an entry happened at. The day is the group heading above it. */
export function entryTime(iso: string): string {
	return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

/** The whole instant, for the tooltip — a timeline shows the day and the clock, not the year. */
export function entryTimestamp(iso: string): string {
	return new Date(iso).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}
