"use client";

import { useAuthStore } from "@/stores/use-auth-store";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-hot-toast";
import { ApiError } from "@/api/api-error";

interface GoogleLoginButtonProps {
  text?: string;
  loadingText?: string;
}

/**
 * The slice of Google Identity Services this component uses.
 *
 * Declared here rather than pulled from @types/google.one-tap: it is three fields, the
 * script is loaded at runtime by the page rather than bundled, and a local shape keeps
 * the `any` out without adding a dependency for one call.
 */
interface GoogleCodeResponse {
  code?: string;
}

interface GoogleIdentityServices {
  accounts: {
    oauth2: {
      initCodeClient(config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleCodeResponse) => void;
      }): { requestCode(): void };
    };
  };
}

export default function GoogleLoginButton({
  text = "Continue with Google",
  loadingText = "Connecting..."
}: GoogleLoginButtonProps) {
  const { loginWithGoogle, isLoading } = useAuthStore();
  const router = useRouter();

  const handleGoogleLogin = () => {
    const google = (window as unknown as { google?: GoogleIdentityServices }).google;
    if (!google) return;

    const client = google.accounts.oauth2.initCodeClient({
      client_id: "DUMMY_GOOGLE_CLIENT_ID",
      scope: "email profile",
      callback: async (response) => {
        if (!response.code) return;
        try {
          await loginWithGoogle(response.code);
          router.push("/");
        } catch (err) {
          if (err instanceof ApiError && err.code === "invalid_credentials") {
            toast.error("Thông tin đăng nhập không chính xác.");
          } else {
            toast.error(err instanceof Error && err.message ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.");
          }
        }
      },
    });
    client.requestCode();
  };

  return (
    <button 
      type="button" 
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-outline-variant rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-semibold text-label-md disabled:opacity-70 disabled:cursor-not-allowed h-12"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {isLoading ? loadingText : text}
    </button>
  );
}
