import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  postLogin,
  postLoginOauth,
  postLogout,
  postPasswordResetRequests,
  postPasswordResets,
  postRegister,
  getMe,
} from "@/api/generated/sdk.gen";
import type {
  AuthResult,
  LoginRequest,
  Me,
  OAuthLoginRequest,
  PasswordResetConfirmRequest,
  RegisterRequest,
} from "@/api/generated/types.gen";
import { clearTokens, setTokens } from "@/api/tokens";
import { getBrowserQueryClient } from "@/api/query-client";
import { useCartStore } from "./use-cart-store";

/**
 * Who is signed in.
 *
 * Kept in zustand rather than in the query cache because it is read from places that are
 * not React — the route guards, the API layer — and because it is persisted, so the
 * header does not flash a signed-out state on every page load. The query cache holds the
 * authoritative copy under `getMe`; this is the one the shell renders from, and
 * `fetchProfile` is what reconciles them.
 */
export type User = Me;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirmRequest) => Promise<void>;
}

/**
 * Drop every cached query.
 *
 * Called on the way in and on the way out. Removing rather than invalidating is the
 * point: an invalidated query refetches, and refetching the previous user's contacts as
 * the new one is exactly the leak to avoid. The next mount fetches fresh.
 */
function resetQueryCache(): void {
  getBrowserQueryClient()?.removeQueries();
}

/** Everything a successful sign-in has to settle, in one place for the three of them. */
function acceptAuth(auth: AuthResult): { user: User; isAuthenticated: true; isLoading: false } {
  setTokens(auth.access_token, auth.refresh_token, auth.expires_in);
  resetQueryCache();

  // Whatever the visitor put in their cart before signing in now belongs to the account.
  // Deliberately not awaited: a failed merge must not fail the sign-in, and the cart page
  // reads the server cart either way — the local lines survive for the next attempt.
  void useCartStore
    .getState()
    .syncLocalCart()
    .then(() => resetQueryCache())
    .catch(() => {});

  return { user: auth.account, isAuthenticated: true, isLoading: false };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await postLogin({ body: credentials, throwOnError: true });
          set(acceptAuth(data.data));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await postRegister({
            // The form does not ask for a locale, so default it rather than let the
            // server guess; an explicit value the caller passes still wins.
            body: { ...payload, locale: payload.locale || "vi-VN" },
            throwOnError: true,
          });
          set(acceptAuth(data.data));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async (credential) => {
        set({ isLoading: true, error: null });
        try {
          // Google asserts an identity, never a locale or a timezone, and the server
          // reads these only when the sign-in creates the account — so an omitted one
          // is a new seller stuck with whatever the default happened to be.
          const body: OAuthLoginRequest = {
            credential,
            provider: "google",
            locale: "vi-VN",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          const { data } = await postLoginOauth({ body, throwOnError: true });
          set(acceptAuth(data.data));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Best effort: the session is over locally whether or not the server agrees,
          // and a failed logout must not strand the user in a signed-in shell.
          await postLogout({ throwOnError: true }).catch(() => {});
        } finally {
          clearTokens();
          resetQueryCache();
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await getMe({ throwOnError: true });
          set({ user: data.data, isAuthenticated: true, isLoading: false });
        } catch {
          // Reaching here means the token was rejected and the refresh in the API layer
          // could not save it, so the persisted user is stale.
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      requestPasswordReset: async (identifier) => {
        set({ isLoading: true, error: null });
        try {
          await postPasswordResetRequests({ body: { identifier }, throwOnError: true });
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      confirmPasswordReset: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await postPasswordResets({ body: payload, throwOnError: true });
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      // The account only. Tokens live in cookies, where src/proxy.ts can read them on
      // the edge; persisting them here would put a credential in localStorage for no gain.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
