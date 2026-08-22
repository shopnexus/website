"use client";

import Image from "next/image";
import Link from "next/link";
import ChatThread from "@/components/chat/ChatThread";
import type { Conversation, ListingDetail, Variant } from "@/api/generated/types.gen";
import ChatDockIntro from "./ChatDockIntro";
import ChatDockListingRef from "./ChatDockListingRef";

/**
 * What is inside the dock: who you are talking to, what about, and the conversation.
 *
 * Split from `ProductChatDock` so that file is about *where* the dock sits and how it opens,
 * and this one is about what it contains. They change for different reasons — a positioning
 * fix and a chat feature — and they were one 220-line component.
 *
 * The three bodies are the three states a chat with a stranger has: not signed in, no thread
 * yet, and a thread. Only the last is the real chat component; the middle one is a composer
 * with suggestions and no conversation behind it, because none exists until something is sent.
 */
export default function ChatDockPanel({
  product,
  variant,
  conversation,
  conversationId,
  isAuthenticated,
  prompts,
  isLoadingPrompts,
  isSending,
  onSendFirst,
  onClose,
}: {
  product: ListingDetail;
  /** The classification on screen — what the pinned card quotes a price for. */
  variant: Variant;
  conversation: Conversation | undefined;
  conversationId: string | undefined;
  isAuthenticated: boolean;
  prompts: readonly string[];
  isLoadingPrompts: boolean;
  isSending: boolean;
  onSendFirst: (body: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const unread = conversation?.unread ?? 0;

  return (
    <>
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

        {/* Only once there is a thread: the inbox has nothing to open before that. */}
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
          onClick={onClose}
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
          prompts={prompts}
          isLoadingPrompts={isLoadingPrompts}
          isSending={isSending}
          onSend={onSendFirst}
        />
      )}
    </>
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
