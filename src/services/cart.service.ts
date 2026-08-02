import { apiClient } from "@/lib/api-client";

export const CartService = {
  getCart: async () => {
    return apiClient<{ data: any[] }>("/cart-items", { requireAuth: true });
  },

  addToCart: async (variantId: string, quantity: number = 1) => {
    return apiClient<{ data: any }>("/cart-items", {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
      requireAuth: true
    });
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    return apiClient<{ data: any }>(`/cart-items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
      requireAuth: true
    });
  },

  removeCartItem: async (itemId: string) => {
    return apiClient(`/cart-items/${itemId}`, {
      method: "DELETE",
      requireAuth: true
    });
  }
};
