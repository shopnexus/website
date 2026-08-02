import { apiClient } from "@/lib/api-client";

export interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  score?: number; // for 'near' queries
}

export interface ListingSearchParams {
  q?: string;
  category_id?: string;
  seller_id?: string;
  mine?: boolean;
  page?: number;
  limit?: number;
  ids?: string[];
}

export const CatalogService = {
  getCategories: async (near?: string) => {
    const url = near ? `/categories?near=${encodeURIComponent(near)}` : "/categories";
    return apiClient<{ data: Category[] }>(url, { requireAuth: false });
  },

  searchListings: async (params: ListingSearchParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append("q", params.q);
    if (params.category_id) searchParams.append("category_id", params.category_id);
    if (params.seller_id) searchParams.append("seller_id", params.seller_id);
    if (params.mine !== undefined) searchParams.append("mine", String(params.mine));
    if (params.page) searchParams.append("page", String(params.page));
    if (params.limit) searchParams.append("limit", String(params.limit));
    if (params.ids && params.ids.length > 0) {
      params.ids.forEach(id => searchParams.append("ids", id));
    }

    const qs = searchParams.toString();
    const url = qs ? `/listings?${qs}` : "/listings";
    
    // Browse/search is generally public unless 'mine' is requested
    const requireAuth = !!params.mine;
    
    return apiClient<{ data: any[], meta: any }>(url, { requireAuth });
  },

  getListingDetail: async (id: string) => {
    return apiClient<{ data: any }>(`/listings/${id}`, { requireAuth: false });
  }
};
