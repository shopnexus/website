"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useChatSuggestions } from "@/hooks/api/useCatalog";
import { useAuthStore } from "@/stores/use-auth-store";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import { chatPrompts } from "../_lib/chat-prompts";
import { useProductChat } from "../_hooks/useProductChat";
import ChatDockPanel from "./ChatDockPanel";

/**
 * Ask the seller a question without leaving the listing.
 *
 * "Chat" used to mean a redirect: create the thread, navigate to `/inbox`, and the buyer lost
 * the photo they were looking at, the classification they had picked and their place on the
 * page. Coming back was a fresh load of all of it. On a marketplace where the counterparty is
 * a person, that question is part of deciding — it belongs beside the price, not on another
 * screen.
 *
 * The thread inside is the real one, not a second implementation: the same component the
 * inbox renders, with the same history, attachments, replies and read receipts. What the dock
 * adds is the reference — the listing pinned above the messages for the buyer, and
 * `refs.listing_id` on every message they send, which is what the seller's inbox turns back
 * into a banner at their end. Without it the seller reads "còn không?" from someone they have
 * traded with before and has no idea which of their listings is meant.
 *
 * Nothing is created until the first send. See `useProductChat`.
 *
 * This file is where the dock *is*; `ChatDockPanel` is what it contains.
 */
export default function ProductChatDock({
  product,
  variant,
  open,
  onOpenChange,
  liftedForBottomBar,
}: {
  product: ListingDetail;
  /** The classification on screen — what the pinned card quotes a price for. */
  variant: Variant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Whether the mobile buy bar is showing, which the button has to clear. */
  liftedForBottomBar: boolean;
}) {
  const me = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { conversationId, conversation, isSending, sendFirst } = useProductChat(product);

  const isOwn = me?.id === product.seller.id;
  const unread = conversation?.unread ?? 0;

  /**
   * The openers, written for this listing by the server.
   *
   * Asked for only when they will be shown — the panel is open, the reader is signed in, and
   * there is no thread yet — because each call costs a model call. `chatPrompts` is the fallback
   * when that request fails or the deployment has no model behind it: a chat that opens without
   * chips still opens, and the fixed list is better than an empty row.
   */
  const wantsPrompts = open && isAuthenticated && !isOwn && !conversationId;
  const suggestions = useChatSuggestions(product.id, wantsPrompts);
  const prompts =
    suggestions.data && suggestions.data.questions.length > 0
      ? suggestions.data.questions
      : chatPrompts(product);

  // Escape closes it, from anywhere inside. A panel that can only be dismissed by finding its
  // × is a panel that covers the corner of the page until the reader navigates away.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Opening it is a request to read it, so that is where the keyboard goes.
  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  // Nobody chats with themselves, and the server refuses the conversation anyway.
  if (isOwn) return null;

  // Above the mobile buy bar while it is showing. Past `xl` there is no bar — the buy card is a
  // sticky column instead — so the offset is the same either way.
  const buttonBottom = liftedForBottomBar ? "bottom-[84px] xl:bottom-6" : "bottom-4 xl:bottom-6";

  /**
   * Both states grow out of and shrink back into the bottom-right corner, so the panel reads
   * as the button opening rather than as a dialog arriving over the page. A spring rather than
   * a duration: the panel is a physical object being pulled open, and the overshoot is what
   * makes it feel like one.
   *
   * Skipped for a reader who asked their system for less movement — there, a chat window that
   * is simply there is the correct behaviour, not a degraded one.
   */
  const grow = {
    initial: { opacity: 0, scale: 0.9, y: 16 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.94, y: 10 },
    transition: reducedMotion
      ? { duration: 0 }
      : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 },
    style: { transformOrigin: "bottom right" },
  };

  return (
    // `mode="wait"` so the button has left before the panel arrives: they occupy the same
    // corner, and cross-fading them puts two chat controls on screen at once.
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key="panel"
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-label={`Trò chuyện với ${product.seller.name}`}
          {...grow}
          className={[
            "fixed z-50 flex flex-col overflow-hidden bg-surface shadow-2xl outline-none",
            // A sheet off the bottom edge on a phone, a panel in the corner on a desktop. Same
            // element: two of them would be two DOM copies of a live thread.
            "inset-x-0 bottom-0 h-[85vh] rounded-t-2xl border-t border-outline-variant",
            "sm:inset-x-auto sm:right-6 sm:h-[min(560px,72vh)] sm:w-[380px] sm:border sm:border-outline-variant",
            // Clears the buy bar between `sm` and `xl`, where the panel is a corner box and the
            // bar is still on screen. Below `sm` it is a sheet that covers the bar anyway.
            liftedForBottomBar ? "sm:bottom-[80px] xl:bottom-0" : "sm:bottom-0",
          ].join(" ")}
        >
          <ChatDockPanel
            product={product}
            variant={variant}
            conversation={conversation}
            conversationId={conversationId}
            isAuthenticated={isAuthenticated}
            prompts={prompts}
            isLoadingPrompts={suggestions.isLoading}
            isSending={isSending}
            onSendFirst={sendFirst}
            onClose={() => onOpenChange(false)}
          />
        </motion.div>
      ) : (
        <motion.button
          key="button"
          type="button"
          onClick={() => onOpenChange(true)}
          {...grow}
          whileHover={reducedMotion ? undefined : { scale: 1.05 }}
          whileTap={reducedMotion ? undefined : { scale: 0.95 }}
          aria-label={`Chat với ${product.seller.name}`}
          className={[
            "fixed right-4 z-50 flex items-center gap-2 rounded-full bg-primary py-3 pl-4 pr-5 text-on-primary shadow-lg sm:right-6",
            "transition-[bottom] duration-300 motion-reduce:transition-none",
            buttonBottom,
          ].join(" ")}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            chat
          </span>
          <span className="hidden font-label-md sm:inline">Chat với người bán</span>
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-error px-1 font-label-xs text-on-error">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
