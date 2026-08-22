"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import type { Conversation, ConversationId, ListingDetail } from "@/api/generated/types.gen";
import { useConversations, useStartConversationWithMessage } from "@/hooks/api/useChat";
import { useAuthStore } from "@/stores/use-auth-store";

/**
 * The thread behind the chat dock: find it, or make it at the last possible moment.
 *
 * Chat has one conversation per pair of accounts, reused for every listing they ever discuss.
 * So there is nothing to create per product — the dock's job is to find the thread these two
 * already share and point the next message at this listing.
 *
 * Creating it on open would be wrong in a way that costs the seller something real: a chat
 * bubble is on every product page, most people who press it are looking rather than asking,
 * and each of those presses would put an empty thread in the seller's inbox. So the first
 * send is what creates it, and until then nothing has been written anywhere.
 *
 * The conversation list is read for a signed-in reader whether or not the dock has been
 * opened, because the button carries an unread badge and a badge that only appears after you
 * press the thing it is on is not a badge. It is the same query key the inbox uses, so on a
 * session that has been to the inbox it is already in cache, and the socket keeps it fresh.
 */
export function useProductChat(product: ListingDetail) {
  const sellerId = product.seller.id;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { conversations, isLoading } = useConversations(30, isAuthenticated);
  const startWithMessage = useStartConversationWithMessage();

  /** Set once this dock created the thread, before the list has been refetched. */
  const [createdId, setCreatedId] = useState<ConversationId | null>(null);

  /**
   * Support threads are excluded by `ticket_id`: the desk is a counterparty like any other
   * on the wire, and a buyer who has an open ticket must not have their question to a seller
   * land in it.
   */
  const existing = useMemo(
    (): Conversation | undefined =>
      conversations.find(
        (conversation) => !conversation.ticket_id && conversation.counterparty.id === sellerId,
      ),
    [conversations, sellerId],
  );

  const conversation = createdId
    ? (conversations.find((row) => row.id === createdId) ?? existing)
    : existing;
  const conversationId = createdId ?? existing?.id;

  /**
   * Say the first thing. Resolves to true when it landed, so the composer knows whether to
   * clear itself — a failed send must leave the text where the person typed it.
   */
  const sendFirst = async (body: string): Promise<boolean> => {
    const trimmed = body.trim();
    if (trimmed === "") return false;
    try {
      const { conversation: started } = await startWithMessage.mutateAsync({
        accountId: sellerId,
        body: trimmed,
        refs: { listing_id: product.id },
      });
      setCreatedId(started.id);
      return true;
    } catch {
      toast.error("Không gửi được tin nhắn. Thử lại nhé.");
      return false;
    }
  };

  return {
    conversationId,
    conversation,
    /** Nothing to show yet, as opposed to "there is no thread": the list is still in flight. */
    isResolving: isAuthenticated && isLoading,
    isSending: startWithMessage.isPending,
    sendFirst,
  };
}
