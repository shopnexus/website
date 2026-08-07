import type { ListingStatus } from "@/api/generated/types.gen"

/**
 * Which list is on screen. `queue` is not a status — the server's default is "awaiting a
 * decision", which spans a listing pending its first publication *and* a live one holding
 * an edit. Naming a status asks a different question entirely (every `active` listing),
 * so the tabs are not four slices of one list.
 */
export type ListingQueueTab = "queue" | ListingStatus

/** One field a seller changed, as the two values a moderator compares. */
export interface EditDiffRow {
	label: string
	before: string
	after: string
}
