"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/use-auth-store";

/**
 * Reconciles the persisted account with the server, once per page load.
 *
 * The store keeps the signed-in account in localStorage so the shell does not flash a
 * signed-out header, but nothing refreshed that copy: it was written at sign-in and then
 * only ever by a form submit. Anything the account changed elsewhere — confirming an
 * address from the emailed link, a suspension, a role — stayed invisible until the user
 * happened to save a profile form.
 *
 * Guarded on being signed in. `getMe` without a session answers 401, which the API layer
 * turns into a redirect to the sign-in page, and a visitor browsing listings must not be
 * sent there.
 */
export default function AuthSync() {
  useEffect(() => {
    if (!useAuthStore.getState().isAuthenticated) return;
    void useAuthStore.getState().fetchProfile();
  }, []);

  return null;
}
