"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ChatThread from "@/components/chat/ChatThread";
import { useAuthStore } from "@/stores/use-auth-store";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import { chatPrompts } from "../_lib/chat-prompts";
import { useProductChat } from "../_hooks/useProductChat";
import ChatDockIntro from "./ChatDockIntro";
import ChatDockListingRef from "./ChatDockListingRef";

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
  const { conversationId, conversation, isSending, sendFirst } = useProductChat(product);

  const isOwn = me?.id === product.seller.id;
  const unread = conversation?.unread ?? 0;

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

  const bottom = liftedForBottomBar ? "bottom-[84px] xl:bottom-6" : "bottom-4 xl:bottom-6";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className={[
          "fixed right-4 z-50 flex items-center gap-2 rounded-full bg-primary py-3 pl-4 pr-5 text-on-primary shadow-lg sm:right-6",
          "transition-[bottom,transform] duration-300 hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100",
          bottom,
        ].join(" ")}
        aria-label={`Chat với ${product.seller.name}`}
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
      </button>
    );
  }

  return (
    <div
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-label={`Trò chuyện với ${product.seller.name}`}
      className={[
        "fixed z-50 flex flex-col overflow-hidden bg-surface shadow-2xl outline-none",
        // A sheet off the bottom edge on a phone, a panel in the corner on a desktop. Same
        // element: two of them would be two DOM copies of a live thread.
        "inset-x-0 bottom-0 h-[85vh] rounded-t-2xl border-t border-outline-variant",
        "sm:inset-x-auto sm:right-6 sm:h-[min(560px,72vh)] sm:w-[380px] sm:rounded-t-2xl sm:border sm:border-outline-variant",
        liftedForBottomBar ? "sm:bottom-[84px] xl:bottom-0" : "sm:bottom-0",
      ].join(" ")}
    >
      <header className="flex shrink-0 items-center gap-2.5 border-b border-outline-variant bg-surface px-3 py-2.5">
        <Link
          href={`/shop/${product.seller.id}`}
          className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-secondary-container"
        >
          {product.seller.avatar?.url ? (
            <Image
              src={product.seller.avatar.url}
              alt=""
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-label-md text-on-secondary-container">
              {product.seller.name.charAt(0)}
            </span>
          )}
        </Link>

        <Link
          href={`/shop/${product.seller.id}`}
          className="min-w-0 flex-1 truncate font-label-md text-on-surface transition-colors hover:text-primary"
        >
          {product.seller.name}
        </Link>

        {conversationId && (
          <Link
            href={`/inbox?c=${conversationId}&listing_id=${product.id}`}
            title="Mở trong hộp thư"
            aria-label="Mở trong hộp thư"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
              open_in_full
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Đóng khung chat"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            close
          </span>
        </button>
      </header>

      <ChatDockListingRef product={product} variant={variant} />

      {!isAuthenticated ? (
        <SignInPrompt listingId={product.id} sellerName={product.seller.name} />
      ) : conversationId ? (
        <ChatThread
          conversationId={conversationId}
          counterparty={{
            name: product.seller.name,
            avatarUrl: product.seller.avatar?.url ?? null,
          }}
          refs={{ listing_id: product.id }}
          unread={unread}
          counterpartyReadAt={conversation?.counterparty_read_at}
          readAt={conversation?.read_at}
          placeholder={`Viết tin nhắn cho ${product.seller.name}...`}
        />
      ) : (
        <ChatDockIntro
          sellerName={product.seller.name}
          prompts={chatPrompts(product)}
          isSending={isSending}
          onSend={sendFirst}
        />
      )}
    </div>
  );
}

/**
 * The panel opens signed out rather than bouncing straight to the login form: a reader who
 * pressed a chat button wants to know what is behind it before they hand over an account.
 */
function SignInPrompt({ listingId, sellerName }: { listingId: string; sellerName: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="material-symbols-outlined text-[32px] text-outline" aria-hidden="true">
        lock
      </span>
      <p className="font-body-sm text-on-surface-variant">
        Đăng nhập để nhắn cho {sellerName}. Tin nhắn sẽ kèm sẵn sản phẩm này.
      </p>
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(`/product/${listingId}`)}`}
        className="rounded-full bg-primary px-5 py-2 font-label-md text-on-primary transition-opacity hover:opacity-90"
      >
        Đăng nhập
      </Link>
    </div>
  );
}
