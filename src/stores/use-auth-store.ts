import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService } from "@/services/auth.service";

export interface Resource {
  id: string;
  url: string;
}

export interface Profile {
  avatar: Resource | null;
  country: string;
  created_at: string;
  date_of_birth: string | null;
  description: string | null;
  gender: string | null;
}

export interface User {
  id: string;
  email: string | null;
  email_verified: boolean;
  has_password: boolean;
  identity_verified: boolean;
  phone: string | null;
  username: string | null;
  role: "user" | "moderator" | "admin";
  status: "active" | "suspended";
  created_at: string;
  profile: Profile;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<void>;
  confirmPasswordReset: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await AuthService.login(credentials);
          const { access_token, refresh_token, expires_in, account } = res.data;
          
          if (typeof window !== "undefined") {
            document.cookie = `access_token=${access_token}; path=/; max-age=${expires_in}; SameSite=Lax`;
            document.cookie = `refresh_token=${refresh_token}; path=/; max-age=2592000; SameSite=Lax`;
          }

          set({ user: account, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || "Đăng nhập thất bại", isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await AuthService.register(data);
          const { access_token, refresh_token, expires_in, account } = res.data;

          if (typeof window !== "undefined") {
            document.cookie = `access_token=${access_token}; path=/; max-age=${expires_in}; SameSite=Lax`;
            document.cookie = `refresh_token=${refresh_token}; path=/; max-age=2592000; SameSite=Lax`;
          }

          set({ user: account, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || "Đăng ký thất bại", isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async (credential: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await AuthService.loginWithGoogle(credential);
          const { access_token, refresh_token, expires_in, account } = res.data;

          if (typeof window !== "undefined") {
            document.cookie = `access_token=${access_token}; path=/; max-age=${expires_in}; SameSite=Lax`;
            document.cookie = `refresh_token=${refresh_token}; path=/; max-age=2592000; SameSite=Lax`;
          }

          set({ user: account, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || "Đăng nhập Google thất bại", isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Best effort to call logout on backend
          await AuthService.logout().catch(() => {});
        } finally {
          if (typeof window !== "undefined") {
            document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
          set({ user: null, isAuthenticated: false });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await AuthService.fetchProfile();
          set({ user: res.data, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          // If we fail to fetch profile, likely token is invalid/expired and refresh failed.
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      requestPasswordReset: async (identifier: string) => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.requestPasswordReset(identifier);
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message || "Yêu cầu khôi phục mật khẩu thất bại", isLoading: false });
          throw error;
        }
      },

      confirmPasswordReset: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.confirmPasswordReset(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message || "Đặt lại mật khẩu thất bại", isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      // Only store user profile locally to avoid flashing logged-out state,
      // tokens are safely in cookies
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
