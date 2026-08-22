import type { ConversationId, Ticket, TicketStatus } from "@/api/generated/types.gen"
import { TICKET_KIND_VI, TICKET_REASON_VI } from "@/lib/dictionaries"

/**
 * A support ticket, as the inbox sees it.
 *
 * A ticket *is* a conversation — its thread is where the requester's words went and where
 * the desk answers — so it reads in the same pane as everything else. What the ticket adds
 * over a trade thread is a status and a verdict, and that is all these helpers carry.
 */

/** Tickets keyed by the thread they are discussed in, so a row can name itself. */
export function ticketsByConversation(tickets: readonly Ticket[]): Map<ConversationId, Ticket> {
	const map = new Map<ConversationId, Ticket>()
	for (const ticket of tickets) {
		if (ticket.conversation_id) map.set(ticket.conversation_id, ticket)
	}
	return map
}

/** "Báo cáo tin đăng · Hàng giả" — what was raised, and on what grounds when there are any. */
export function ticketKindLine(ticket: Ticket): string {
	const kind = TICKET_KIND_VI[ticket.kind]
	return ticket.reason ? `${kind} · ${TICKET_REASON_VI[ticket.reason]}` : kind
}

/**
 * How a status reads on a surface. `open` is waiting on the desk, `reviewing` is being
 * worked, `resolved` is closed — three states, three weights.
 */
export const TICKET_STATUS_TONE: Record<TicketStatus, string> = {
	open: "bg-tertiary/10 text-tertiary border-tertiary/25",
	reviewing: "bg-secondary-container text-on-secondary-container border-transparent",
	resolved: "bg-surface-container-high text-on-surface-variant border-outline-variant",
}

/** Where the thing a ticket is about can be opened, or null when it has no page. */
export function ticketRefHref(ticket: Ticket): string | null {
	if (!ticket.ref_id) return null
	switch (ticket.ref_type) {
		case "listing":
			return `/product/${ticket.ref_id}`
		case "order":
			return `/account/orders/${ticket.ref_id}`
		case "refund":
			return `/account/refunds/${ticket.ref_id}`
		case "account":
			return `/shop/${ticket.ref_id}`
		default:
			// A message, a review or a reply has no page of its own to open.
			return null
	}
}
