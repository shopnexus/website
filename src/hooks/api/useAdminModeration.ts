"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	postAdminListingsByIdApproval,
	postAdminListingsByIdTakedown,
	postAdminRefundsByIdVerdict,
	postAdminTicketsByIdClaim,
	postAdminTicketsByIdResolution,
} from "@/api/generated/sdk.gen"
import {
	getAdminListingsInfiniteOptions,
	getAdminTicketsByIdOptions,
	getAdminTicketsInfiniteOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	ListingId,
	ListingStatus,
	RefundId,
	RefundVerdictRequest,
	ResolveTicketRequest,
	TakedownRequest,
	TicketId,
	TicketKind,
	TicketStatus,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { cursorPagination, flattenPages, pagePagination, totalCountOf } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/**
 * The two staff queues this console works — support tickets and listings awaiting a
 * decision — plus the one verdict that is made somewhere else entirely.
 *
 * A moderator's write always moves two views at once: the queue they are working and the
 * requester's or seller's own view of the same row. So each mutation drops both, and
 * `invalidate` is awaited so the button stays busy until the list under it is the new one.
 */

// ── Tickets ──────────────────────────────────────────────────────────────────

/**
 * The queue, oldest first.
 *
 * Omitting `status` is not "every status": the server defaults to open + reviewing, which
 * is the hot slice the queue is worked from and the only one its index covers. Asking for
 * `resolved` is therefore a lookup rather than a queue.
 */
export function useAdminTickets(status?: TicketStatus, kind?: TicketKind, limit = 20) {
	const query = useInfiniteQuery({
		...getAdminTicketsInfiniteOptions({ query: { status, kind, limit } }),
		...cursorPagination,
	})

	const tickets = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, tickets }
}

/**
 * One case: the ticket, who raised it, who claimed it, what it is about, and how many
 * other open tickets name the same target — a decision rests on the pattern rather than
 * on one complaint, which is why the count is on the read and not computed here.
 */
export function useAdminTicket(id: string | undefined) {
	return useQuery({
		...getAdminTicketsByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id),
	})
}

/**
 * Taking a case off the open queue so two moderators do not work it at once.
 *
 * Only from `open`; the loser of a race is answered `ticket_not_claimable` rather than
 * silently taking a case somebody else is already answering.
 */
export function useClaimTicket() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: TicketId) => {
			const { data } = await postAdminTicketsByIdClaim({ path: { id }, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidateTicket(queryClient),
	})
}

/**
 * The verdict and what was done about it.
 *
 * Recording the action does not carry it out: taking a listing down and suspending a
 * seller are separate calls to the modules that own them. And a `refund-dispute` is
 * refused here (409 `ticket_decided_elsewhere`) — see `useRefundVerdict`.
 */
export function useResolveTicket() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: TicketId; body: ResolveTicketRequest }) => {
			const { data } = await postAdminTicketsByIdResolution({
				path: { id },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidateTicket(queryClient),
	})
}

/**
 * The refund dispute's verdict, made where the money is.
 *
 * Order decides it and publishes the fact; trust then closes *every* open ticket about
 * that sale and posts the note into each thread. So this invalidates the queues as well
 * as the refund and the order, even though it names none of them.
 */
export function useRefundVerdict() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: RefundId; body: RefundVerdictRequest }) => {
			const { data } = await postAdminRefundsByIdVerdict({
				path: { id },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () =>
			invalidate(
				queryClient,
				OPERATIONS.adminTickets,
				OPERATIONS.adminTicket,
				OPERATIONS.tickets,
				OPERATIONS.ticket,
				OPERATIONS.refunds,
				OPERATIONS.refund,
				OPERATIONS.orders,
				OPERATIONS.order,
			),
	})
}

// ── Listings ─────────────────────────────────────────────────────────────────

/**
 * The listing queue, oldest first, page-paginated like every other catalog read.
 *
 * Omitting `status` is the queue proper: a listing awaiting its first publication *and* a
 * live one holding an edit its seller submitted. Naming a status asks a different
 * question — every `active` listing, say — so the tabs above this are not all the same
 * kind of list.
 */
export function useAdminListings(status?: ListingStatus, limit = 20) {
	const query = useInfiniteQuery({
		...getAdminListingsInfiniteOptions({ query: { status, limit } }),
		...pagePagination,
	})

	const listings = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, listings, totalCount: totalCountOf(query.data) }
}

/** Clearing whatever was awaiting a decision — a first publication or a held edit. */
export function useApproveListing() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, note }: { id: ListingId; note?: string }) => {
			const { data } = await postAdminListingsByIdApproval({
				path: { id },
				body: { note },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidateListing(queryClient),
	})
}

/**
 * Removing a listing from the marketplace and recording why.
 *
 * Suspending the seller as well is a separate decision and a separate call, so this
 * never implies one.
 */
export function useTakedownListing() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: ListingId; body: TakedownRequest }) => {
			const { data } = await postAdminListingsByIdTakedown({
				path: { id },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidateListing(queryClient),
	})
}

// A ticket write moves the staff queue and the requester's own history of it.
function invalidateTicket(queryClient: Parameters<typeof invalidate>[0]) {
	return invalidate(
		queryClient,
		OPERATIONS.adminTickets,
		OPERATIONS.adminTicket,
		OPERATIONS.tickets,
		OPERATIONS.ticket,
	)
}

// A verdict on a listing decides whether the marketplace serves it, so the public feed
// and the product page are stale too — and the verdict is itself the newest row of the
// listing's trail, which the panel that made it is showing.
function invalidateListing(queryClient: Parameters<typeof invalidate>[0]) {
	return invalidate(
		queryClient,
		OPERATIONS.adminListings,
		OPERATIONS.listings,
		OPERATIONS.listing,
		OPERATIONS.listingHistory,
	)
}
