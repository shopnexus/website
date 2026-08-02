import { apiClient } from "@/lib/api-client";
import { User } from "@/stores/use-auth-store";

export interface UpdateAccountRequest {
  username?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ChangePasswordRequest {
  current_password?: string;
  new_password?: string;
}

export const AccountService = {
  updateIdentifiers: async (data: UpdateAccountRequest) => {
    return apiClient<{ data: User }>("/account", { 
      method: "PATCH", 
      body: JSON.stringify(data) 
    });
  },

  changePassword: async (data: ChangePasswordRequest) => {
    return apiClient("/password", { 
      method: "PUT", 
      body: JSON.stringify(data) 
    });
  },

  getOAuthIdentities: async () => {
    return apiClient<{ data: any[] }>("/me/oauth-identities");
  },

  unlinkProvider: async (provider: string) => {
    return apiClient(`/me/oauth-identities/${provider}`, { method: "DELETE" });
  },

  getPushDevices: async () => {
    return apiClient<{ data: any[] }>("/me/devices");
  },

  updateProfile: async (data: any) => {
    return apiClient<{ data: any }>("/me/profile", {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },

  requestUpload: async (data: { filename: string; mime: string; size: number; kind: string }) => {
    return apiClient<{ data: any }>("/me/uploads", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  confirmUpload: async (resourceId: string) => {
    return apiClient(`/me/uploads/${resourceId}/confirmation`, {
      method: "POST"
    });
  },

  getVerificationHistory: async () => {
    return apiClient<{ data: any[] }>("/me/identity-documents");
  },

  startVerification: async (data: any) => {
    return apiClient<{ data: any }>("/identity-documents", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  getFollowing: async (page = 1, limit = 20) => {
    return apiClient<{ data: any[], meta: any }>(`/me/following?page=${page}&limit=${limit}`);
  },

  followSeller: async (accountId: string) => {
    return apiClient(`/follows/${accountId}`, { method: "PUT" });
  },

  unfollowSeller: async (accountId: string) => {
    return apiClient(`/follows/${accountId}`, { method: "DELETE" });
  },

  getNotificationBadge: async () => {
    return apiClient<{ data: { total: number } }>("/notifications/unread-count");
  },

  getNotifications: async (cursor?: string, limit = 20, category?: string) => {
    let query = `?limit=${limit}`;
    if (cursor) query += `&cursor=${cursor}`;
    if (category && category !== "all") query += `&category=${category}`;
    return apiClient<{ data: any[], meta: any }>(`/notifications${query}`);
  },

  markNotificationsRead: async (timestamp: string) => {
    return apiClient("/notifications", { 
      method: "PATCH", 
      body: JSON.stringify({ up_to: timestamp }) 
    });
  },

  getNotificationPreferences: async () => {
    return apiClient<{ data: any[] }>("/notification-preferences");
  },

  updateNotificationPreferences: async (data: any) => {
    return apiClient<{ data: any[] }>("/notification-preferences", {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }
};
