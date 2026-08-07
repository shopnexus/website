"use client"

import { useConversation } from "@/hooks/api/useChat"
import { useAdminTicket } from "@/hooks/api/useAdminModeration"
import { isClaimable, isRefundDispute, readOrderRefund, readTarget } from "../../_lib/queue.logic"

/**
 * Everything one case needs, assembled once.
 *
 * The thread is read separately and only for its unread count — opening it is the read
 * receipt, and the ticket row does not carry one. Staff are let into a ticket thread
 * without being a side of it, so the count is the *desk's*: whoever answers next inherits
 * the mark the previous moderator left.
 */
export function useTicketCase(id: string) {
	const { data: entry, isLoading, isError } = useAdminTicket(id)
	const thread = useConversation(entry?.ticket.conversation_id ?? undefined)

	return {
		entry,
		isLoading,
		isError,
		target: entry ? readTarget(entry) : null,
		// The live refund on the order this ticket names, which is what the verdict acts on.
		orderRefund: entry ? readOrderRefund(entry) : null,
		unread: thread.data?.unread ?? 0,
		claimable: entry ? isClaimable(entry.ticket) : false,
		// The one kind whose verdict moves money, so it is decided in the order module and
		// this route answers 409 for it.
		refundDispute: entry ? isRefundDispute(entry.ticket) : false,
	}
}
