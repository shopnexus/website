"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	deleteRefundsById,
	postRefundsByIdAcceptance,
	postRefundsByIdAttachments,
	postRefundsByIdReturnTransportCheckpoints,
} from "@/api/generated/sdk.gen"
import {
	getRefundsByIdOptions,
	getRefundsInfiniteOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	Refund,
	RefundId,
	RefundStatus,
	ResourceId,
	TransportCheckpoint,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/**
 * Every refund the caller is a party to, both the ones they raised and the ones raised
 * against them.
 *
 * No `role` parameter: omitting it is what makes the route answer both sides, and "a case
 * that needs me" spans them — the buyer's own claim and a claim against something they
 * sold are the same queue of things to answer.
 */
export function useRefunds(status?: RefundStatus, limit = 20) {
	const query = useInfiniteQuery({
		...getRefundsInfiniteOptions({ query: { status, limit } }),
		...cursorPagination,
	})

	const refunds = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, refunds }
}

/**
 * The case's evidence, with each resource appearing once.
 *
 * `attachments` is an append-only list server-side and nothing there enforces uniqueness
 * — neither the request schema nor the domain's append — so a resource submitted again
 * while the case is open is stored a second time and comes back twice. Dropped here
 * rather than at the render because two copies of one photo are not two pieces of
 * evidence: a case that looks like it carries four photos when it carries three misreads
 * the record a verdict gets reached on, and every reader of this query would otherwise
 * have to know that.
 */
function unwrapRefund(envelope: { data: Refund }): Refund {
	const refund = unwrapData(envelope)
	const seen = new Set<ResourceId>()
	const attachments = refund.attachments.filter((attachment) => {
		if (seen.has(attachment.id)) return false
		seen.add(attachment.id)
		return true
	})
	if (attachments.length === refund.attachments.length) return refund
	return { ...refund, attachments }
}

export function useRefund(id: string | undefined) {
	return useQuery({
		...getRefundsByIdOptions({ path: { id: id! } }),
		select: unwrapRefund,
		enabled: Boolean(id),
	})
}

/**
 * The buyer dropping their own case. Refused once the seller has decided — by then there
 * is a verdict on the record, and walking away would erase it.
 */
export function useWithdrawRefund() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: RefundId) => {
			await deleteRefundsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidateRefund(queryClient),
	})
}

/**
 * The seller granting it. This does not move money yet: the goods go back first, and the
 * seller still gets an inspection window once they arrive.
 */
export function useAcceptRefund() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: RefundId) => {
			const { data } = await postRefundsByIdAcceptance({ path: { id }, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidateRefund(queryClient),
	})
}

/**
 * The leg carrying the goods back.
 *
 * No carrier is booked for it, so this is the one shipment either party reports on — and
 * who reports `delivered` decides where the case goes: the seller acknowledging opens
 * their inspection window, while the buyer claiming it hands the case to staff, because a
 * window that pays out on the seller's silence is one a buyer who posted nothing could
 * simply wait out.
 */
export function useReportReturn() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, status }: { id: RefundId; status: TransportCheckpoint }) => {
			const { data } = await postRefundsByIdReturnTransportCheckpoints({
				path: { id },
				body: { status },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidateRefund(queryClient),
	})
}

/** Evidence, from either side, for as long as the case is open. */
export function useAddRefundAttachments() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, attachments }: { id: RefundId; attachments: ResourceId[] }) => {
			const { data } = await postRefundsByIdAttachments({
				path: { id },
				body: { attachments },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidateRefund(queryClient),
	})
}

// A refund decides the order's escrow, so a settled one changes the order too.
function invalidateRefund(queryClient: Parameters<typeof invalidate>[0]) {
	return invalidate(
		queryClient,
		OPERATIONS.refunds,
		OPERATIONS.refund,
		OPERATIONS.orders,
		OPERATIONS.order,
	)
}
