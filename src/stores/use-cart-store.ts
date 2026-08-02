import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartService } from "@/services/cart.service";
import { CatalogService } from "@/services/catalog.service";

export interface LocalCartItem {
  listing_id: string;
  variant_id: string;
  quantity: number;
}

export interface ResolvedCartItem {
  cartItemId: string; // "local-{variant_id}" for local, real UUID for server
  quantity: number;
  spu: any;
  sku: any;
}

interface CartState {
  localItems: LocalCartItem[];
  resolvedItems: ResolvedCartItem[];
  isLoading: boolean;
  
  addToCart: (listingId: string, variantId: string, quantity: number, isAuthenticated: boolean) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number, isAuthenticated: boolean) => Promise<void>;
  removeItem: (cartItemId: string, isAuthenticated: boolean) => Promise<void>;
  
  fetchCart: () => Promise<void>;
  syncLocalCart: () => Promise<void>;
  resolveLocalCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      localItems: [],
      resolvedItems: [],
      isLoading: false,

      addToCart: async (listingId, variantId, quantity, isAuthenticated) => {
        if (isAuthenticated) {
          await CartService.addToCart(variantId, quantity);
          await get().fetchCart();
        } else {
          const { localItems } = get();
          const existing = localItems.find(i => i.variant_id === variantId);
          let newLocalItems;
          if (existing) {
            newLocalItems = localItems.map(i => 
              i.variant_id === variantId ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            newLocalItems = [...localItems, { listing_id: listingId, variant_id: variantId, quantity }];
          }
          set({ localItems: newLocalItems });
          await get().resolveLocalCart();
        }
      },

      updateQuantity: async (cartItemId, quantity, isAuthenticated) => {
        if (isAuthenticated) {
          await CartService.updateCartItem(cartItemId, quantity);
          await get().fetchCart();
        } else {
          const variantId = cartItemId.replace("local-", "");
          const { localItems } = get();
          const newLocalItems = localItems.map(i => 
            i.variant_id === variantId ? { ...i, quantity } : i
          );
          set({ localItems: newLocalItems });
          await get().resolveLocalCart();
        }
      },

      removeItem: async (cartItemId, isAuthenticated) => {
        if (isAuthenticated) {
          await CartService.removeCartItem(cartItemId);
          await get().fetchCart();
        } else {
          const variantId = cartItemId.replace("local-", "");
          const { localItems } = get();
          const newLocalItems = localItems.filter(i => i.variant_id !== variantId);
          set({ localItems: newLocalItems });
          await get().resolveLocalCart();
        }
      },

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const res = await CartService.getCart();
          const cartItems = res.data || [];
          
          if (cartItems.length === 0) {
            set({ resolvedItems: [], isLoading: false });
            return;
          }

          const listingIds = [...new Set(cartItems.map((i: any) => i.listing_id))];
          const listingsRes = await CatalogService.searchListings({ ids: listingIds, limit: 100 });
          const listings = listingsRes.data || [];

          const resolved = cartItems.map((item: any) => {
            const spu = listings.find((l: any) => l.id === item.listing_id);
            const sku = spu?.skus?.find((s: any) => s.id === item.variant_id) || spu?.skus?.[0];
            return {
              cartItemId: item.id,
              quantity: item.quantity,
              spu,
              sku
            };
          }).filter((item: any) => item.spu); // filter out if listing was deleted

          set({ resolvedItems: resolved, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch cart", error);
          set({ isLoading: false });
        }
      },

      resolveLocalCart: async () => {
        const { localItems } = get();
        if (localItems.length === 0) {
          set({ resolvedItems: [] });
          return;
        }

        set({ isLoading: true });
        try {
          const listingIds = [...new Set(localItems.map(i => i.listing_id))];
          const listingsRes = await CatalogService.searchListings({ ids: listingIds, limit: 100 });
          const listings = listingsRes.data || [];

          const resolved = localItems.map(item => {
            const spu = listings.find((l: any) => l.id === item.listing_id);
            const sku = spu?.skus?.find((s: any) => s.id === item.variant_id) || spu?.skus?.[0];
            return {
              cartItemId: `local-${item.variant_id}`,
              quantity: item.quantity,
              spu,
              sku
            };
          }).filter(item => item.spu);

          set({ resolvedItems: resolved, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      syncLocalCart: async () => {
        const { localItems } = get();
        if (localItems.length === 0) return;

        try {
          for (const item of localItems) {
            await CartService.addToCart(item.variant_id, item.quantity);
          }
          set({ localItems: [] }); // clear local after sync
          await get().fetchCart();
        } catch (error) {
          console.error("Failed to sync local cart", error);
        }
      }
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ localItems: state.localItems }),
    }
  )
);
