import { apiClient } from "@/lib/api-client";

export interface CreateDraftRequest {
  listing_id: string;
}

export interface CheckoutLine {
  variant_id: string;
  quantity: number;
}

export interface CheckoutRequest {
  contact_id: string;
  transport_option: string;
  currency: string;
  lines: CheckoutLine[];
  note?: string;
}

export interface ShippingQuotesRequest {
  contact_id: string;
  draft_id: string;
  lines: CheckoutLine[];
}

export const OrderService = {
  // 1. DRAFT ORDERS (Tạo trước khi checkout)
  createDraftOrder: async (data: CreateDraftRequest) => {
    return apiClient<{ data: any }>("/drafts", {
      method: "POST",
      body: JSON.stringify(data),
      requireAuth: true
    });
  },

  getDraft: async (id: string) => {
    return apiClient<{ data: any }>(`/drafts/${id}`, {
      requireAuth: true
    });
  },

  getShippingQuotes: async (data: ShippingQuotesRequest) => {
    return apiClient<{ data: any[] }>("/shipping-quotes", {
      method: "POST",
      body: JSON.stringify(data),
      requireAuth: true
    });
  },

  checkoutDraft: async (draftId: string, data: CheckoutRequest) => {
    return apiClient<{ data: { payment_session_id: string, items: any[], total: number } }>(`/drafts/${draftId}/checkout`, {
      method: "POST",
      body: JSON.stringify(data),
      requireAuth: true
    });
  },

  getDrafts: async (cursor?: string, limit = 20) => {
    let url = `/drafts?limit=${limit}`;
    if (cursor) url += `&cursor=${cursor}`;
    return apiClient<{ data: any[], meta: any }>(url, { requireAuth: true });
  },

  // 2. ORDERS (Quản lý đơn hàng)
  getOrders: async (role: "buyer" | "seller", state?: string, cursor?: string, limit = 20) => {
    const searchParams = new URLSearchParams();
    searchParams.append("role", role);
    searchParams.append("limit", String(limit));
    if (state) searchParams.append("state", state);
    if (cursor) searchParams.append("cursor", cursor);

    return apiClient<{ data: any[], meta: any }>(`/orders?${searchParams.toString()}`, { requireAuth: true });
  },

  getOrderDetail: async (id: string) => {
    return apiClient<{ data: any }>(`/orders/${id}`, { requireAuth: true });
  }
};
