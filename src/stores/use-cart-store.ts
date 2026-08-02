import { create } from "zustand";
import { persist } from "zustand/middleware";
import { postCartItems } from "@/api/generated/sdk.gen";
import type { ListingId, VariantId } from "@/api/generated/types.gen";

/**
 * The guest cart.
 *
 * Only the signed-out cart lives here. It has to survive a reload with no account to
 * hang it on, so it is local state with `persist` and there is nothing to fetch or
 * invalidate. The signed-in cart is server state and belongs to the query cache — see
 * hooks/api/useCart.ts, which reads whichever of the two is in play and resolves both
 * through the same shape.
 *
 * A line is a variant and a count. Prices and names are deliberately absent: they move,
 * and a cart that remembers last week's price is worse than one that looks them up.
 */

export interface LocalCartItem {
	listing_id: ListingId;
	variant_id: VariantId;
	quantity: number;
}

interface CartState {
	localItems: LocalCartItem[];

	addLocal: (item: LocalCartItem) => void;
	setLocalQuantity: (variantId: VariantId, quantity: number) => void;
	removeLocal: (variantId: VariantId) => void;
	clearLocal: () => void;

	/**
	 * Push the guest cart to the server after a sign-in, then empty it.
	 *
	 * Adding the same variant twice tops the row up server-side rather than failing, so
	 * merging into an existing account cart is safe. The caller invalidates the cart
	 * query afterwards.
	 */
	syncLocalCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			localItems: [],

			addLocal: ({ listing_id, variant_id, quantity }) =>
				set(({ localItems }) => {
					const existing = localItems.find((i) => i.variant_id === variant_id);
					if (existing) {
						return {
							localItems: localItems.map((i) =>
								i.variant_id === variant_id
									? { ...i, quantity: i.quantity + quantity }
									: i,
							),
						};
					}
					return { localItems: [...localItems, { listing_id, variant_id, quantity }] };
				}),

			setLocalQuantity: (variantId, quantity) =>
				set(({ localItems }) => ({
					localItems:
						quantity <= 0
							? localItems.filter((i) => i.variant_id !== variantId)
							: localItems.map((i) =>
									i.variant_id === variantId ? { ...i, quantity } : i,
								),
				})),

			removeLocal: (variantId) =>
				set(({ localItems }) => ({
					localItems: localItems.filter((i) => i.variant_id !== variantId),
				})),

			clearLocal: () => set({ localItems: [] }),

			syncLocalCart: async () => {
				const { localItems } = get();
				if (localItems.length === 0) return;

				// Sequential, not parallel: each add mutates the same cart row set, and the
				// server tops up an existing row rather than replacing it.
				for (const item of localItems) {
					await postCartItems({
						body: { variant_id: item.variant_id, quantity: item.quantity },
						throwOnError: true,
					});
				}
				set({ localItems: [] });
			},
		}),
		{
			name: "cart-storage",
			partialize: (state) => ({ localItems: state.localItems }),
		},
	),
);
