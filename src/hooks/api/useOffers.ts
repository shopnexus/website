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
import { cursorPagination, flattenPages } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

const OFFERS = "getOffers"
const OFFER = "getOffersById"

export function useOffers(role: "seller" | "buyer", limit = 30) {
	const query = useInfiniteQuery({
		...getOffersInfiniteOptions({ query: { limit, role } }),
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [{ _id: OFFERS }] })
		},
	})
}

export function useAcceptOffer() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: OfferId) => {
			const { data } = await postOffersByIdAcceptance({ path: { id }, throwOnError: true })
			return data.data
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: [{ _id: OFFERS }] })
			queryClient.invalidateQueries({ queryKey: [{ _id: OFFER }, { path: { id } }] })
		},
	})
}

export function useCheckoutOffer() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, body }: { id: OfferId; body: CheckoutOfferRequest }) => {
			const { data } = await postOffersByIdCheckout({ path: { id }, body, throwOnError: true })
			return data.data
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: [{ _id: OFFERS }] })
			queryClient.invalidateQueries({ queryKey: [{ _id: OFFER }, { path: { id } }] })
		},
	})
}

export function useCancelOffer() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id }: { id: OfferId }) => {
			const { data } = await deleteOffersById({ path: { id }, throwOnError: true })
			return data
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: [{ _id: OFFERS }] })
			queryClient.invalidateQueries({ queryKey: [{ _id: OFFER }, { path: { id } }] })
		},
	})
}
