import type { AdminTicket, Ticket, TicketRefType, TicketStatus } from "@/api/generated/types.gen"
import { TICKET_STATUS_VI } from "@/lib/dictionaries"
import type { TargetView, TicketQueueTab } from "./types"

/**
 * Pure reading of a queue row. Nothing here touches React or the network: a moderator's
 * screen is mostly derived facts — how long this has waited, what it points at — and
 * those are the parts worth being able to reason about on their own.
 */

export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
	open: "bg-primary/10 text-primary border border-primary/20",
	reviewing: "bg-secondary-container text-on-secondary-container",
	resolved: "bg-surface-container-high text-on-surface-variant",
}

const REF_TYPE_VI: Record<TicketRefType, string> = {
	listing: "Tin đăng",
	account: "Tài khoản",
	message: "Tin nhắn",
	review: "Đánh giá",
	"review-reply": "Phản hồi đánh giá",
	order: "Đơn hàng",
	refund: "Yêu cầu hoàn tiền",
}

/** Claiming is only possible from `open`; anything else answers `ticket_not_claimable`. */
export function isClaimable(ticket: Ticket): boolean {
	return ticket.status === "open"
}

/**
 * A refund dispute is the one kind a moderator cannot resolve by hand: its verdict moves
 * escrow, so order decides it and closes this ticket on the way out.
 */
export function isRefundDispute(ticket: Ticket): boolean {
	return ticket.kind === "refund-dispute"
}

function text(value: unknown): string {
	return typeof value === "string" ? value : ""
}

function nested(value: unknown, key: string): unknown {
	if (typeof value !== "object" || value === null) return undefined
	return (value as Record<string, unknown>)[key]
}

/**
 * What the ticket is about, read out of the untyped `target` the owning module filled in.
 *
 * Untyped because it is polymorphic: a listing, an account, a message and a review have
 * nothing in common but being the thing somebody complained about. It is also empty on
 * two ordinary occasions — a target the owning module no longer has (a listing already
 * taken down), and an order, which no module projects for staff — so this answers a view
 * built from the id alone rather than nothing at all.
 */
/** The live refund on the order a ticket names, when there is one. */
export interface OrderRefund {
	id: string
	status: string
	/** Set once the goods are back, which is what a buyer-win verdict branches on. */
	returnedAt: string | null
}

/**
 * The refund behind a `refund-dispute`.
 *
 * The ticket names the *order* — both parties' complaints about one sale land in one
 * thread — while the verdict route names the refund, and for a while nothing bridged the
 * two, so a moderator had to type the id in by hand off the conversation. The server now
 * carries the live refund inside `target`, so it is read rather than transcribed.
 */
export function readOrderRefund(entry: AdminTicket): OrderRefund | null {
	const target: Record<string, unknown> = entry.target ?? {}
	const refund = target.refund
	if (!refund || typeof refund !== "object") return null
	const row = refund as Record<string, unknown>
	const id = text(row.id)
	if (!id) return null
	return { id, status: text(row.status), returnedAt: text(row.returned_at) || null }
}

export function readTarget(entry: AdminTicket): TargetView | null {
	const { ticket } = entry
	if (!ticket.ref_type) return null
	// The property is always sent, but "empty" is a real answer here — a target the owner
	// no longer has — so this reads it as one rather than trusting it to be an object.
	const target: Record<string, unknown> = entry.target ?? {}

	const view: TargetView = {
		kind: REF_TYPE_VI[ticket.ref_type],
		title: "",
		lines: [],
		href: null,
		refId: ticket.ref_id,
	}

	switch (ticket.ref_type) {
		case "listing": {
			view.title = text(target.name)
			const seller = text(nested(target.seller, "name"))
			if (seller) view.lines.push(`Người bán: ${seller}`)
			if (ticket.ref_id) view.href = `/product/${ticket.ref_id}`
			break
		}
		case "account": {
			view.title = text(target.name)
			const createdAt = text(target.created_at)
			if (createdAt) {
				view.lines.push(`Tham gia ${new Date(createdAt).toLocaleDateString("vi-VN")}`)
			}
			if (ticket.ref_id) view.href = `/shop/${ticket.ref_id}`
			break
		}
		case "message":
		case "review":
		case "review-reply": {
			view.title = text(target.body)
			const rating = target.rating
			if (typeof rating === "number") view.lines.push(`${rating}/5 sao`)
			break
		}
		// An order carries no projection for staff, so its id is the whole view.
		case "order":
		case "refund":
			break
	}

	return view
}

/**
 * The slices of the queue, as the strip above it draws them.
 *
 * Data rather than JSX so the overview page can name the same tab a card links into
 * without importing the strip that renders them.
 */
export const QUEUE_TABS: ReadonlyArray<{ id: TicketQueueTab; label: string }> = [
	{ id: "queue", label: "Đang chờ xử lý" },
	{ id: "open", label: TICKET_STATUS_VI.open },
	{ id: "reviewing", label: TICKET_STATUS_VI.reviewing },
	{ id: "resolved", label: TICKET_STATUS_VI.resolved },
]
