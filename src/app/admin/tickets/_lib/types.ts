import type { TicketStatus } from "@/api/generated/types.gen"

/**
 * Which slice of the queue is on screen. `queue` is not a status: the server's default is
 * open + reviewing together, which is the only slice its index covers — so asking for one
 * resolved status is a lookup, and the tab has to be able to say that.
 */
export type TicketQueueTab = "queue" | TicketStatus

/** How long a case has been waiting, and how loudly to say so. */
export type WaitTone = "fresh" | "aging" | "stale"

export interface Wait {
	label: string
	tone: WaitTone
}

/** What a ticket is about, as much of it as the owning module handed back. */
export interface TargetView {
	/** Vietnamese name for the kind of thing — "Tin đăng", "Tài khoản". */
	kind: string
	/** Its headline: a listing's name, the first line of a reported message. */
	title: string
	/** Everything else worth reading beside it, already formatted. */
	lines: string[]
	/** Where a moderator goes to look at it themselves, when the app has a page for it. */
	href: string | null
	/** The opaque id, which is all there is for a target no module projects. */
	refId: string | null
}
