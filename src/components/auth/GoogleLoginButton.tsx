"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/use-auth-store";
import { ApiError } from "@/api/api-error";
import { getErrorMessage } from "@/lib/error-mapping";
import { callbackUrlFromLocation, postLoginDestination } from "@/lib/post-login";

/**
 * The slice of Google Identity Services this component uses.
 *
 * `accounts.id` and not `accounts.oauth2`: the oauth2 half is what a custom-styled
 * button can drive, but it hands back an authorization code, and redeeming one needs a
 * client secret this platform deliberately does not hold — the API verifies an OIDC id
 * token locally instead (internal/provider/oauth/oidc). Only `accounts.id` yields that
 * token, and it comes with a button Google insists on drawing itself, which is what the
 * two layers in the markup below are for.
 *
 * Declared here rather than pulled from @types/google.one-tap: the script is loaded at
 * runtime by the page rather than bundled, so a local shape keeps the `any` out without
 * adding a dependency for one call.
 */
interface GoogleCredentialResponse {
  /** The id token. Named `credential` by Google and by POST /login/oauth alike. */
  credential?: string;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
      }): void;
      renderButton(
        parent: HTMLElement,
        options: {
          type?: "standard" | "icon";
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "small" | "medium" | "large";
          text?: "signin_with" | "signup_with" | "continue_with" | "signin";
          shape?: "rectangular" | "pill" | "circle" | "square";
          logo_alignment?: "left" | "center";
          width?: number;
          locale?: string;
        }
      ): void;
    };
  };
}

/** Google's own cap on `width`. A wider box gets a centred button, not a stretched one. */
const MAX_BUTTON_WIDTH = 400;

/** The height Google draws at `size: "large"`, which the overlay is scaled up from. */
const GOOGLE_BUTTON_HEIGHT = 40;

/** The visible button's height (h-12), matching the inputs the auth forms use. */
const VISIBLE_HEIGHT = 48;

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface GoogleLoginButtonProps {
  text?: string;
  loadingText?: string;
}

/** Google Identity Services if the script has landed, read straight off the window. */
function readGoogleIdentity(): GoogleIdentityServices | null {
  return (window as unknown as { google?: GoogleIdentityServices }).google ?? null;
}

/**
 * Call `onChange` when the script lands.
 *
 * It is loaded by (auth)/layout.tsx with `strategy="afterInteractive"`, so it is
 * normally absent on first paint and fires no event a component that did not load it can
 * await — hence polling, which stops the moment it appears.
 */
function subscribeToGoogleIdentity(onChange: () => void): () => void {
  if (readGoogleIdentity()) return () => {};
  const timer = window.setInterval(() => {
    if (!readGoogleIdentity()) return;
    window.clearInterval(timer);
    onChange();
  }, 100);
  return () => window.clearInterval(timer);
}

export default function GoogleLoginButton({
  text = "Tiếp tục với Google",
  loadingText = "Đang kết nối...",
}: GoogleLoginButtonProps) {
  const { loginWithGoogle, isLoading } = useAuthStore();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  // useSyncExternalStore rather than an effect writing state: the script landing is
  // exactly an external store, and `window.google` keeps its identity once set, so the
  // snapshot is stable.
  const gis = useSyncExternalStore(subscribeToGoogleIdentity, readGoogleIdentity, () => null);
  const ready = gis !== null && CLIENT_ID !== "";

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      try {
        await loginWithGoogle(response.credential);
        const role = useAuthStore.getState().user?.role;
        router.replace(postLoginDestination(role, callbackUrlFromLocation()));
      } catch (err) {
        toast.error(
          err instanceof ApiError ? getErrorMessage(err) : "Đăng nhập thất bại. Vui lòng thử lại."
        );
      }
    },
    [loginWithGoogle, router]
  );

  // Google is handed the callback once, when the button is drawn, and keeps it for the
  // life of the page. A ref is what lets that one registration always reach the current
  // router and store without redrawing the button on every change.
  const handlerRef = useRef(handleCredential);
  useEffect(() => {
    handlerRef.current = handleCredential;
  }, [handleCredential]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!gis || !overlay) return;
    if (!CLIENT_ID) {
      // Inlined at build time, so an empty value is a deployment that shipped without
      // it — silent here, and mystifying for whoever clicks nothing.
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set: Google sign-in is unavailable");
      return;
    }

    gis.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => void handlerRef.current(response),
      // Someone who just signed out and clicked the button again wants the chooser, not
      // to be put straight back into the account they left.
      auto_select: false,
    });

    // Width is a pixel count Google bakes into the markup, so a viewport change has to
    // redraw or the invisible button stops covering the visible one. Observing the
    // overlay is safe from a loop: ResizeObserver reports the border box, which neither
    // the transform below nor the children affect — the width comes from `inset-x-0`.
    const draw = () => {
      const box = overlay.clientWidth || MAX_BUTTON_WIDTH;
      const drawn = Math.min(box, MAX_BUTTON_WIDTH);
      overlay.replaceChildren();
      gis.accounts.id.renderButton(overlay, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        locale: "vi",
        width: drawn,
      });
      // Stretched, not laid out: Google caps `width` at 400 and fixes the height at 40,
      // so on the 448px form column both axes fall short and the gap is a strip of the
      // visible button that does nothing when clicked.
      overlay.style.transform = `scale(${box / drawn}, ${VISIBLE_HEIGHT / GOOGLE_BUTTON_HEIGHT})`;
    };
    const observer = new ResizeObserver(draw);
    observer.observe(overlay);
    return () => observer.disconnect();
  }, [gis]);

  return (
    <div className="group relative h-12 w-full">
      {/*
        What the user sees. A div and not a button, and aria-hidden: the real control is
        Google's, sitting invisibly on top, so a second focusable element here would be
        one a keyboard user tabs to and cannot activate.
      */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex h-12 items-center justify-center gap-3 rounded-lg border border-outline-variant bg-surface-container px-4 text-label-md font-semibold text-on-surface transition-colors ${
          ready && !isLoading
            ? "group-hover:bg-surface-container-high group-focus-within:border-primary group-focus-within:border-2"
            : "opacity-70"
        }`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isLoading ? loadingText : text}
      </div>

      {/*
        Google's own button, transparent and stretched over the box above so the whole
        box above so all of it is clickable. Invisible rather than removed: the click has
        to land on Google's own element for the popup to open at all.
      */}
      <div
        ref={overlayRef}
        style={{ height: GOOGLE_BUTTON_HEIGHT }}
        className={`absolute inset-x-0 top-0 origin-top-left opacity-0 ${
          isLoading ? "pointer-events-none" : ""
        }`}
      />
    </div>
  );
}
