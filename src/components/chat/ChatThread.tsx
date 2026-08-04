"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  useConfirmChatUpload,
  useMarkConversationRead,
  useMessages,
  useRequestChatUpload,
  useSendMessage,
} from "@/hooks/api/useChat";
import { useAuthStore } from "@/stores/use-auth-store";
import { sameOriginUploadUrl } from "@/api/upload";
import type { ConversationId } from "@/api/generated/types.gen";
import OfferMessageCard from "@/app/inbox/_components/OfferMessageCard";

/**
 * One chat thread: its messages and the box you write in.
 *
 * The same component serves the inbox and a support ticket, because a ticket *is* a
 * conversation — `body` and `attachments` on `POST /tickets` become its first message and
 * everything after that is ordinary chat. A second implementation would mean two upload
 * flows and two read-receipt rules for one contract.
 */

interface Counterparty {
  name: string;
  avatarUrl?: string | null;
}

interface ChatThreadProps {
  conversationId: ConversationId | undefined;
  /** Whoever is on the other side. Absent while the thread is still resolving. */
  counterparty?: Counterparty;
  /** Attached to every outgoing message — what the sender is pointing at. */
  refs?: Record<string, unknown>;
  /**
   * How a message with no sender reads. `sender_id` is null both on a backend system note
   * and on a support reply, and the contract publishes nothing that tells them apart, so
   * the screen the thread is rendered in decides: in a ticket it is the desk answering.
   */
  nullSenderAs?: "system" | "support";
  /** How many unread messages the thread has, so opening it can post the read receipt. */
  unread?: number;
  placeholder?: string;
}

const SUPPORT_NAME = "ShopNexus Hỗ trợ";

export default function ChatThread({
  conversationId,
  counterparty,
  refs,
  nullSenderAs = "system",
  unread = 0,
  placeholder,
}: ChatThreadProps) {
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const me = useAuthStore((s) => s.user);
  const { messages, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const markRead = useMarkConversationRead();
  const requestUpload = useRequestChatUpload();
  const confirmUpload = useConfirmChatUpload();

  // Opening a thread with unread messages is the read receipt.
  useEffect(() => {
    if (conversationId && unread > 0 && !markRead.isPending) {
      markRead.mutate(conversationId);
    }
    // markRead is stable apart from its pending flag, guarded above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, unread]);

  const handleSend = () => {
    const body = inputText.trim();
    if (!body || !conversationId) return;
    sendMessage.mutate({ body, refs }, { onSuccess: () => setInputText("") });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    try {
      const slot = await requestUpload.mutateAsync({
        filename: file.name,
        mime: file.type,
        size: file.size,
      });

      const res = await fetch(sameOriginUploadUrl(slot.url), {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("File upload failed");

      const uploaded = await confirmUpload.mutateAsync(slot.resource_id);
      await sendMessage.mutateAsync({ attachments: [uploaded.id], refs });
    } catch {
      // The global handler raises the toast.
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isMe = (senderId?: string | null) => Boolean(senderId) && senderId === me?.id;

  const time = (at: string) =>
    new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const incomingName = counterparty?.name ?? "Người dùng";
  const incomingAvatar = counterparty?.avatarUrl;

  return (
    <>
      <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 bg-surface-container-lowest/50">
        {isLoading && (
          <div className="flex justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex justify-center py-8 text-xs text-on-surface-variant">
            {conversationId ? "Chưa có tin nhắn nào." : "Chọn một cuộc trò chuyện để bắt đầu."}
          </div>
        )}

        {messages.map((msg) => {
          const card = msg.card?.offer_id ? (
            <OfferMessageCard offerId={msg.card.offer_id as string} />
          ) : null;

          if (isMe(msg.sender_id)) {
            return (
              <div key={msg.id} className="flex gap-2.5 max-w-[85%] md:max-w-[75%] ml-auto justify-end">
                <div className="flex flex-col items-end space-y-1.5 min-w-0 flex-1">
                  {msg.attachments.length > 0 && (
                    <div className="rounded-xl rounded-br-sm overflow-hidden border border-outline-variant/40 shadow-sm max-w-[220px]">
                      <Image
                        src={msg.attachments[0].url || ""}
                        alt="Ảnh đính kèm"
                        width={240}
                        height={180}
                        className="w-full aspect-[4/3] object-cover"
                      />
                    </div>
                  )}

                  {card ??
                    (msg.body ? (
                      <div className="bg-primary text-on-primary px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl rounded-br-sm text-xs md:text-sm shadow-sm leading-relaxed break-words max-w-full">
                        {msg.body}
                      </div>
                    ) : null)}

                  <span className="text-[9px] text-outline mt-0.5 flex items-center justify-end gap-1">
                    {time(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          }

          // No sender: a backend system note, or — in a ticket — the support desk. A card
          // is always a system note, whichever screen this is.
          if (!msg.sender_id && (nullSenderAs === "system" || card)) {
            return (
              <div key={msg.id} className="flex w-full justify-center my-4">
                <div className="flex flex-col items-center">
                  {card ??
                    (msg.body ? (
                      <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] md:text-xs text-on-surface-variant max-w-[80%] text-center">
                        {msg.body}
                      </span>
                    ) : null)}
                  <span className="text-[9px] text-outline mt-1 block">{time(msg.created_at)}</span>
                </div>
              </div>
            );
          }

          // Support answers as the platform, never as a person: staff are anonymous to the
          // requester, so there is no avatar and no name to show but the desk's.
          const fromSupport = !msg.sender_id;

          return (
            <div key={msg.id} className="flex gap-2.5 max-w-[85%] md:max-w-[75%]">
              <div className="relative w-7 h-7 rounded-full overflow-hidden self-end mb-4 shrink-0 border border-outline-variant/30 bg-surface-container flex items-center justify-center text-xs">
                {fromSupport ? (
                  <span className="material-symbols-outlined text-primary text-[16px]">support_agent</span>
                ) : incomingAvatar ? (
                  <Image src={incomingAvatar} alt="" fill className="object-cover" />
                ) : (
                  incomingName.charAt(0)
                )}
              </div>
              <div className="flex flex-col items-start space-y-1.5 min-w-0 flex-1">
                {fromSupport && (
                  <span className="text-[10px] font-bold text-primary">{SUPPORT_NAME}</span>
                )}

                {msg.attachments.length > 0 && (
                  <div className="rounded-xl rounded-bl-sm overflow-hidden border border-outline-variant/40 shadow-sm max-w-[220px]">
                    <Image
                      src={msg.attachments[0].url || ""}
                      alt="Ảnh đính kèm"
                      width={240}
                      height={180}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </div>
                )}

                {msg.body && (
                  <div className="bg-surface-container-high text-on-surface px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl rounded-bl-sm text-xs md:text-sm shadow-sm leading-relaxed break-words border border-outline-variant/20 max-w-full">
                    {msg.body}
                  </div>
                )}

                <span className="text-[9px] text-outline mt-0.5 block pl-1">{time(msg.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 md:p-4 bg-surface border-t border-outline-variant/30 shrink-0">
        <div className="flex items-center gap-1.5 md:gap-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-1.5 md:p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
          <button
            type="button"
            title="Đính kèm tệp"
            disabled={!conversationId || requestUpload.isPending}
            onClick={() => fileInputRef.current?.click()}
            className="material-symbols-outlined text-outline hover:text-primary p-1.5 transition-colors rounded-full hover:bg-surface-container-low shrink-0 text-[20px] disabled:opacity-40"
          >
            add_circle
          </button>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          <input
            className="flex-1 border-none focus:ring-0 bg-transparent text-xs md:text-sm py-1.5 outline-none text-on-surface placeholder:text-outline"
            placeholder={placeholder ?? (counterparty ? `Viết tin nhắn cho ${incomingName}...` : "Chọn một cuộc trò chuyện...")}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputText.trim() && !sendMessage.isPending) handleSend();
            }}
            type="text"
          />
          <button
            onClick={handleSend}
            type="button"
            title="Gửi tin nhắn"
            disabled={!inputText.trim() || !conversationId || sendMessage.isPending}
            className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 shadow-sm ${
              inputText.trim() && conversationId && !sendMessage.isPending
                ? "bg-primary text-on-primary hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-surface-container-high text-outline cursor-not-allowed opacity-60"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
