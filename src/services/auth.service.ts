import { apiClient } from "@/lib/api-client";
import { User } from "@/stores/use-auth-store";

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  account: User;
}

export const AuthService = {
  login: async (credentials: any) => {
    return apiClient<{ data: AuthResult }>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      requireAuth: false,
    });
  },

  register: async (data: any) => {
    const payload = {
      ...data,
      locale: data.locale || "vi-VN",
    };
    return apiClient<{ data: AuthResult }>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: false,
    });
  },

  loginWithGoogle: async (credential: string) => {
    return apiClient<{ data: AuthResult }>("/login/oauth", {
      method: "POST",
      body: JSON.stringify({ credential, provider: "google" }),
      requireAuth: false,
    });
  },

  logout: async () => {
    return apiClient("/logout", { method: "POST" });
  },

  fetchProfile: async () => {
    return apiClient<{ data: User }>("/me", { method: "GET" });
  },

  requestPasswordReset: async (identifier: string) => {
    return apiClient("/password/reset-requests", {
      method: "POST",
      body: JSON.stringify({ identifier }),
      requireAuth: false,
    });
  },

  confirmPasswordReset: async (data: any) => {
    return apiClient("/password/resets", {
      method: "POST",
      body: JSON.stringify(data),
      requireAuth: false,
    });
  },
};
