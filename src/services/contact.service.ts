import { apiClient } from "@/lib/api-client";

export interface Contact {
  id: string;
  full_name: string;
  phone: string;
  phone_verified?: boolean;
  country: string;
  province_code: string;
  province_name: string;
  district_code?: string | null;
  district_name?: string | null;
  ward_code: string;
  ward_name: string;
  address: string;
  address_detail?: string | null;
  address_type: "home" | "work";
  is_default_delivery: boolean;
  is_default_pickup: boolean;
  latitude?: number | null;
  longitude?: number | null;
  postal_code?: string | null;
  created_at: string;
}

export interface CreateContactRequest {
  full_name: string;
  phone: string;
  country: string;
  province_code: string;
  province_name: string;
  district_code?: string | null;
  district_name?: string | null;
  ward_code: string;
  ward_name: string;
  address: string;
  address_detail?: string | null;
  address_type: "home" | "work";
  is_default_delivery: boolean;
  is_default_pickup: boolean;
  latitude?: number | null;
  longitude?: number | null;
  postal_code?: string | null;
}

export type UpdateContactRequest = Partial<CreateContactRequest>;

export const ContactService = {
  getContacts: async () => {
    return apiClient<{ data: Contact[] }>("/contacts", { requireAuth: true });
  },

  createContact: async (data: CreateContactRequest) => {
    return apiClient<{ data: Contact }>("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  updateContact: async (id: string, data: UpdateContactRequest) => {
    return apiClient<{ data: Contact }>(`/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  deleteContact: async (id: string) => {
    return apiClient(`/contacts/${id}`, {
      method: "DELETE",
      requireAuth: true,
    });
  },
};
