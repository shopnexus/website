"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { postTickets } from "@/api/generated/sdk.gen"
import {
	getTicketsByIdOptions,
	getTicketsInfiniteOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type { OpenTicketRequest, TicketKind, TicketStatus } from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/**
 * Support tickets: one surface for abuse reports, refund disputes, order and payment
 * problems, feature requests and anything else. `kind` is the only thing that differs
 * between them.
 *
 * A ticket *is* a conversation — `body` and `attachments` become the first message of a
 * thread, and `conversation_id` on the ticket is where the rest of it happens — so there
 * is nothing here for reading or writing messages. That is the chat hooks' job.
 */

export function useTickets(status?: TicketStatus, limit = 20) {
	const query = useInfiniteQuery({
		...getTicketsInfiniteOptions({ query: { status, limit } }),
		...cursorPagination,
	})

	const tickets = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, tickets }
}

/**
 * One ticket. Reading it also repairs a missing `conversation_id`: the row and the thread
 * live in different schemas, so one lands first and the read is what pairs them — which
 * is why the thread is only rendered from this and never from the list.
 */
export function useTicket(id: string | undefined) {
	return useQuery({
		...getTicketsByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id),
	})
}

export function useOpenTicket() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: OpenTicketRequest) => {
			const { data } = await postTickets({ body, throwOnError: true })
			return data.data
		},
		// The thread the ticket opens shows up in the conversation list too.
		onSuccess: () =>
			invalidate(queryClient, OPERATIONS.tickets, OPERATIONS.conversations),
	})
}

/**
 * The kinds that name something, and the id prefix each one's `ref_id` must carry. The
 * server refuses a mismatch, so this is what lets a form ask for the right thing rather
 * than discover it from a 400.
 */
export const TICKET_REF_PREFIX: Partial<Record<TicketKind, string>> = {
	"report-listing": "lst",
	"report-account": "acc",
	"report-message": "msg",
	"report-review": "rvw",
	"report-review-reply": "rpl",
	"refund-dispute": "rfd",
	"order-issue": "ord",
}

/** A reason belongs to a report and to no other kind. */
export function isReportKind(kind: TicketKind): boolean {
	return kind.startsWith("report-")
}
