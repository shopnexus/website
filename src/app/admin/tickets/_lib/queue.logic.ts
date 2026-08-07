import type { AdminTicket, Ticket, TicketRefType, TicketStatus } from "@/api/generated/types.gen"
import type { TargetView, Wait } from "./types"

/**
 * Pure reading of a queue row. Nothing here touches React or the network: a moderator's
 * screen is mostly derived facts — how long this has waited, what it points at — and
 * those are the parts worth being able to reason about on their own.
 */

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * How long the case has been open, in the units a person answers in.
 *
 * The queue is oldest-first by contract, so the wait is the row's leading fact rather
 * than a detail at the end of it — and the tone is what turns a sorted list into a
 * worklist. A day is when a requester starts asking again; three is when they stop.
 */
export function waitSince(createdAt: string, now: number): Wait {
	const elapsed = Math.max(0, now - new Date(createdAt).getTime())
	const days = Math.floor(elapsed / DAY)
	const hours = Math.floor((elapsed % DAY) / HOUR)

	let label: string
	if (days > 0) label = hours > 0 ? `${days}n ${hours}g` : `${days}n`
	else if (hours > 0) label = `${hours}g`
	else label = `${Math.max(1, Math.floor(elapsed / MINUTE))}p`

	if (days >= 3) return { label, tone: "stale" }
	if (days >= 1) return { label, tone: "aging" }
	return { label, tone: "fresh" }
}

/** The wait gutter's colour, keyed on the tone rather than recomputed per component. */
export const WAIT_TONE_STYLES: Record<Wait["tone"], string> = {
	fresh: "bg-surface-container-high text-on-surface-variant",
	aging: "bg-tertiary-container text-on-tertiary-container",
	stale: "bg-error-container text-on-error-container",
}

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
