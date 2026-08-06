"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	deleteOffersById,
	postOffers,
	postOffersByIdAcceptance,
	postOffersByIdCheckout,
} from "@/api/generated/sdk.gen"
import {
	getOffersInfiniteOptions,
	getOffersByIdOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	OfferId,
	CreateOfferRequest,
	CheckoutOfferRequest,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/**
 * Price negotiations.
 *
 * Every write here also lands a system message in the thread the pair already share — the
 * offer card the inbox renders — so the conversation list and its messages are invalidated
 * alongside the offer itself. `offer` as well as `offers`: the card reads the single offer,
 * and that is the thing whose price must not go stale.
 */
const FED = [
	OPERATIONS.offers,
	OPERATIONS.offer,
	OPERATIONS.conversations,
	OPERATIONS.messages,
] as const

/**
 * Both sides in one list. There is no `role` to pass: an account haggles as a buyer on one
 * listing and as a seller on another, and the route always answered both — the parameter was
 * documented for a while and never read, so the two values returned the same rows. Which of
 * these is waiting on you is `author_id`, per row.
 */
export function useOffers(limit = 30) {
	const query = useInfiniteQuery({
		...getOffersInfiniteOptions({ query: { limit } }),
		...cursorPagination,
	})

	const offers = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, offers }
}

export function useOffer(offerId: OfferId | undefined) {
	return useQuery({
		...getOffersByIdOptions({ path: { id: offerId! } }),
		select: unwrapData,
		enabled: Boolean(offerId),
	})
}

export function useCreateOffer() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (body: CreateOfferRequest) => {
			const { data } = await postOffers({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, ...FED),
	})
}

export function useAcceptOffer() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: OfferId) => {
			const { data } = await postOffersByIdAcceptance({ path: { id }, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, ...FED),
	})
}

export function useCheckoutOffer() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, body }: { id: OfferId; body: CheckoutOfferRequest }) => {
			const { data } = await postOffersByIdCheckout({ path: { id }, body, throwOnError: true })
			return data.data
		},
		// A checked-out offer opens a payment session, and the order appears when that
		// completes, so the order list is what the buyer is sent to look at.
		onSuccess: () => invalidate(queryClient, ...FED, OPERATIONS.orders),
	})
}

export function useCancelOffer() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id }: { id: OfferId }) => {
			const { data } = await deleteOffersById({ path: { id }, throwOnError: true })
			return data
		},
		onSuccess: () => invalidate(queryClient, ...FED),
	})
}
