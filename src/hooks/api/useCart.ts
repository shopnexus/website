"use client"

import { useCallback, useMemo } from "react"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteCartItemsById, patchCartItemsById, postCartItems } from "@/api/generated/sdk.gen"
import {
	getCartItemsOptions,
	getListingsByIdOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	CartItemId,
	ListingDetail,
	ListingId,
	Variant,
	VariantId,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { unwrapData } from "@/api/unwrap"
import { useAuthStore } from "@/stores/use-auth-store"
import { useCartStore } from "@/stores/use-cart-store"

/** A cart line with the listing and variant behind it resolved. */
export interface ResolvedCartItem {
	/** The server row id, or `local-<variantId>` for a guest line. */
	cartItemId: string
	quantity: number
	listing: ListingDetail
	variant: Variant | undefined
}

const localId = (variantId: VariantId) => `local-${variantId}`
const isLocalId = (cartItemId: string) => cartItemId.startsWith("local-")
const variantOfLocalId = (cartItemId: string) => cartItemId.slice("local-".length) as VariantId

// ── Server cart ──────────────────────────────────────────────────────────────

export function useCartItems(enabled = true) {
	return useQuery({
		...getCartItemsOptions(),
		select: unwrapData,
		enabled,
	})
}

export function useAddToCart() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			variantId,
			quantity = 1,
		}: {
			variantId: VariantId
			quantity?: number
		}) => {
			const { data } = await postCartItems({
				body: { variant_id: variantId, quantity },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.cartItems),
	})
}

export function useUpdateCartItem() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, quantity }: { id: CartItemId; quantity: number }) => {
			const { data } = await patchCartItemsById({
				path: { id },
				body: { quantity },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.cartItems),
	})
}

export function useRemoveCartItem() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: CartItemId) => {
			await deleteCartItemsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.cartItems),
	})
}

// ── The cart a page actually renders ─────────────────────────────────────────

/**
 * The whole cart, signed in or not, with prices and names resolved.
 *
 * A cart line — server or local — carries only `listing_id`, `variant_id` and a count.
 * Resolving a price means reading the listing, because a variant's price lives on the
 * variant and `GET /listings` returns listings without their variants; only
 * `GET /listings/{id}` carries them, and there is no GET on `/variants/{id}` at all. So
 * this fires one detail query per distinct listing in the cart, each cached and shared
 * with the product page that may already have fetched it.
 */
export function useCart() {
	const queryClient = useQueryClient()
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

	const localItems = useCartStore((s) => s.localItems)
	const setLocalQuantity = useCartStore((s) => s.setLocalQuantity)
	const removeLocal = useCartStore((s) => s.removeLocal)
	const addLocal = useCartStore((s) => s.addLocal)

	const { data: serverItems, isLoading: isLoadingCart } = useCartItems(isAuthenticated)

	const updateCartItem = useUpdateCartItem()
	const removeCartItem = useRemoveCartItem()
	const addServerItem = useAddToCart()

	// One list, whichever side it came from.
	const lines = useMemo(() => {
		if (isAuthenticated) {
			return (serverItems ?? []).map((item) => ({
				cartItemId: item.id as string,
				listingId: item.listing_id,
				variantId: item.variant_id,
				quantity: item.quantity,
			}))
		}
		return localItems.map((item) => ({
			cartItemId: localId(item.variant_id),
			listingId: item.listing_id,
			variantId: item.variant_id,
			quantity: item.quantity,
		}))
	}, [isAuthenticated, serverItems, localItems])

	const listingIds = useMemo(
		() => [...new Set(lines.map((l) => l.listingId))],
		[lines],
	)

	const listingQueries = useQueries({
		queries: listingIds.map((id) => ({
			...getListingsByIdOptions({ path: { id } }),
			// A listing in a cart is one the shopper is about to pay for: its price and
			// stock matter more here than anywhere else.
			staleTime: 15_000,
		})),
	})

	// Unwrapped here rather than through `select`, because the generated options object
	// pins its own TData and overriding select to return a different shape is a type
	// error. The envelope is one property deep; a useMemo is cheaper than fighting it.
	const listingsById = useMemo(() => {
		const map = new Map<ListingId, ListingDetail>()
		for (const query of listingQueries) {
			if (query.data) map.set(query.data.data.id, query.data.data)
		}
		return map
	}, [listingQueries])

	const items = useMemo<ResolvedCartItem[]>(
		() =>
			lines.flatMap((line) => {
				const listing = listingsById.get(line.listingId)
				// A listing that has been deleted outright drops out rather than rendering
				// as a blank row.
				if (!listing) return []
				return [
					{
						cartItemId: line.cartItemId,
						quantity: line.quantity,
						listing,
						variant: listing.variants.find((v) => v.id === line.variantId),
					},
				]
			}),
		[lines, listingsById],
	)

	const subtotal = useMemo(
		() => items.reduce((sum, item) => sum + (item.variant?.price ?? 0) * item.quantity, 0),
		[items],
	)

	const updateQuantity = useCallback(
		(cartItemId: string, quantity: number) => {
			if (isLocalId(cartItemId)) {
				setLocalQuantity(variantOfLocalId(cartItemId), quantity)
				return
			}
			updateCartItem.mutate({ id: cartItemId as CartItemId, quantity })
		},
		[setLocalQuantity, updateCartItem],
	)

	const removeItem = useCallback(
		(cartItemId: string) => {
			if (isLocalId(cartItemId)) {
				removeLocal(variantOfLocalId(cartItemId))
				return
			}
			removeCartItem.mutate(cartItemId as CartItemId)
		},
		[removeLocal, removeCartItem],
	)

	const addItem = useCallback(
		async (listingId: ListingId, variantId: VariantId, quantity = 1) => {
			if (isAuthenticated) {
				await addServerItem.mutateAsync({ variantId, quantity })
				return
			}
			addLocal({ listing_id: listingId, variant_id: variantId, quantity })
		},
		[isAuthenticated, addServerItem, addLocal],
	)

	/** Merge the guest cart into the account's after a sign-in. */
	const syncLocalCart = useCallback(async () => {
		await useCartStore.getState().syncLocalCart()
		await invalidate(queryClient, OPERATIONS.cartItems)
	}, [queryClient])

	return {
		items,
		subtotal,
		count: lines.length,
		isLoading: isLoadingCart || listingQueries.some((q) => q.isLoading),
		addItem,
		updateQuantity,
		removeItem,
		syncLocalCart,
	}
}
