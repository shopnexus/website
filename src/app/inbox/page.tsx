"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ChatThread from "@/components/chat/ChatThread";
import { useConversations, useMessages } from "@/hooks/api/useChat";
import { useListing } from "@/hooks/api/useCatalog";
import type { ConversationId, ListingId } from "@/api/generated/types.gen";
import OfferModal from "@/components/offers/OfferModal";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

function InboxContent() {
  const searchParams = useSearchParams();
  const queryC = searchParams.get("c");
  const queryListingId = searchParams.get("listing_id");

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [selectedConvId, setSelectedConvId] = useState<ConversationId | "">("");
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const { conversations: allConversations, isLoading: isLoadingConversations } = useConversations();

  // A ticket's thread is read at /support/[id], with the ticket's status and verdict around
  // it. Listed here it would be a nameless chat with the desk and no way back to the ticket.
  const conversations = useMemo(
    () => allConversations.filter((c) => !c.ticket_id),
    [allConversations],
  );

  const visibleConversations = useMemo(
    () => (activeTab === "unread" ? conversations.filter((c) => c.unread > 0) : conversations),
    [conversations, activeTab],
  );

  // Derived rather than synced: the first conversation is the default until one is
  // picked, and a picked thread that leaves the list falls back to the first again.
  const activeConvId =
    (selectedConvId && conversations.some((c) => c.id === selectedConvId)
      ? selectedConvId
      : queryC && conversations.some((c) => c.id === queryC)
      ? (queryC as ConversationId)
      : conversations[0]?.id) ?? "";

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeContact = activeConv?.counterparty;

  // The same query ChatThread reads, so this shares its cache rather than fetching again.
  const { messages } = useMessages(activeConvId || undefined);

  /**
   * The listing this thread is about.
   *
   * A conversation carries no listing of its own — it is between two accounts, and can
   * outlive any one item. What it has is `refs` on each message, which is what the
   * sender pointed at, so the panel shows the most recently referenced listing.
   */
  const referencedListingId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const ref = messages[i].refs?.listing_id;
      if (typeof ref === "string") return ref as ListingId;
    }
    return undefined;
  }, [messages]);

  // Only use the URL's listing_id if we're still viewing the conversation from the URL.
  // Otherwise, if the user switches chats, we only want the listing referenced in that specific chat.
  const activeListingId = (
    activeConvId === queryC ? (queryListingId || referencedListingId) : referencedListingId
  ) as ListingId | undefined;
  const { data: activeProduct } = useListing(activeListingId);

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] w-full">
      <div className="w-full h-[calc(100vh-76px)] overflow-hidden">
        <div className="flex h-full border-t border-outline-variant/30 relative w-full">
          
          <aside
            className={`w-full md:w-[300px] lg:w-[320px] xl:w-[340px] 2xl:w-[360px] shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col h-full absolute md:relative z-20 transition-transform duration-300 ${
              showChatMobile ? "-translate-x-full md:translate-x-0" : "translate-x-0"
            }`}
          >
            <div className="p-4 border-b border-outline-variant/20 shrink-0">
              <h1 className="text-base font-bold text-on-surface mb-3 flex items-center justify-between">
                <span>Hộp thư</span>
                <span className="text-[11px] font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/30">
                  {conversations.length} hội thoại
                </span>
              </h1>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                  search
                </span>
                <input
                  className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-xs transition-all outline-none text-on-surface placeholder:text-outline"
                  placeholder="Tìm kiếm tin nhắn..."
                  type="text"
                />
              </div>
            </div>

            <div className="flex border-b border-outline-variant/20 px-4 bg-surface-container-lowest gap-1.5 pt-1.5 shrink-0 overflow-x-auto no-scrollbar">
              <button
                className={`py-2 px-2.5 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === "all"
                    ? "text-primary border-primary font-bold bg-primary-container/10 rounded-t-md"
                    : "text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-container-low rounded-t-md"
                }`}
                onClick={() => setActiveTab("all")}
              >
                Tất cả
              </button>
              <button
                className={`py-2 px-2.5 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1 ${
                  activeTab === "unread"
                    ? "text-primary border-primary font-bold bg-primary-container/10 rounded-t-md"
                    : "text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-container-low rounded-t-md"
                }`}
                onClick={() => setActiveTab("unread")}
              >
                Chưa đọc
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
              {isLoadingConversations && (
                <div className="p-8 flex justify-center">
                  <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                </div>
              )}
              {!isLoadingConversations && visibleConversations.length === 0 && (
                <div className="p-8 text-center text-xs text-on-surface-variant">
                  {activeTab === "unread" ? "Không có tin nhắn chưa đọc." : "Chưa có cuộc trò chuyện nào."}
                </div>
              )}
              {visibleConversations.map((conv) => {
                const isActive = activeConvId === conv.id;
                const contact = conv.counterparty;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setShowChatMobile(true);
                    }}
                    className={`p-3 flex items-center gap-2.5 transition-colors cursor-pointer border-l-[3px] ${
                      isActive
                        ? "bg-secondary-container/30 border-primary"
                        : "hover:bg-surface-container border-transparent bg-surface-container-lowest"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border border-outline-variant/20 bg-surface-container flex items-center justify-center text-on-surface-variant font-bold">
                        {contact.avatar?.url ? (
                          <Image src={contact.avatar.url} alt={contact.name} fill className="object-cover" />
                        ) : (
                          contact.name.charAt(0)
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className={`text-xs truncate ${conv.unread > 0 ? "font-bold text-on-surface" : "font-medium text-on-surface"}`}>
                          {contact.name}
                        </h3>
                        <span className={`text-[10px] shrink-0 font-medium ${conv.unread > 0 ? "text-primary font-bold" : "text-outline"}`}>
                          {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-1.5">
                        <p className={`text-xs truncate ${conv.unread > 0 ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                          {conv.last_message?.body || "Hình ảnh/Tệp"}
                        </p>
                        {conv.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="flex-1 flex flex-col bg-surface overflow-hidden min-w-0 relative z-10">
            
            <div className="px-4 py-2.5 md:px-5 md:py-3 flex justify-between items-center border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowChatMobile(false)}
                  className="md:hidden p-1 -ml-1 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-outline-variant/30 shrink-0 bg-surface-container flex items-center justify-center text-on-surface-variant font-bold">
                  {activeContact?.avatar?.url ? (
                    <Image src={activeContact.avatar.url} alt={activeContact.name} fill className="object-cover" />
                  ) : (
                    activeContact?.name.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm md:text-base font-bold text-on-surface">
                      {activeContact?.name || "Người dùng"}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Negotiating Product Banner */}
            {activeProduct && (
              <div className="bg-surface border-b border-outline-variant/30 p-2 md:p-3 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
                <div className="flex items-center gap-3 overflow-hidden">
                  {activeProduct.images?.[0]?.url ? (
                    <Image 
                      src={activeProduct.images[0].url} 
                      alt="" 
                      width={48} 
                      height={48} 
                      className="rounded object-cover shrink-0 w-10 h-10 md:w-12 md:h-12 border border-outline-variant/50" 
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container rounded shrink-0"></div>
                  )}
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs md:text-sm text-on-surface font-medium truncate leading-tight">{activeProduct.name}</span>
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(
                        activeProduct.variants.find((v) => v.is_featured)?.price ??
                          activeProduct.variants[0]?.price ??
                          0,
                      )}
                    </span>
                  </div>
                </div>
                {activeProduct.price_mode === "negotiable" && (
                  <Button
                    variant="outline"
                    className="shrink-0 h-8 md:h-9 px-3 md:px-4 text-[10px] md:text-xs font-bold rounded-lg border-primary text-primary ml-2"
                    onClick={() => setIsOfferModalOpen(true)}
                  >
                    Thương lượng
                  </Button>
                )}
              </div>
            )}

            <ChatThread
              conversationId={activeConvId || undefined}
              counterparty={
                activeContact ? { name: activeContact.name, avatarUrl: activeContact.avatar?.url } : undefined
              }
              unread={activeConv?.unread ?? 0}
              refs={activeProduct ? { listing_id: activeProduct.id } : undefined}
            />

            <OfferModal
              isOpen={isOfferModalOpen}
              onClose={() => setIsOfferModalOpen(false)}
              product={activeProduct || null}
            />
          </section>

          <aside className="hidden lg:flex w-[280px] xl:w-[300px] 2xl:w-[320px] flex-col bg-surface-container-lowest border-l border-outline-variant/30 overflow-y-auto no-scrollbar shrink-0">
            <div className="p-4 md:p-5">
              <h3 className="font-headline text-[11px] font-bold uppercase tracking-wider text-outline mb-4">
                Chi tiết sản phẩm
              </h3>

              {activeProduct ? (
                <div className="rounded-xl overflow-hidden bg-surface-container-low mb-5 group cursor-pointer border border-outline-variant/20 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                  <div className="aspect-[4/3] overflow-hidden relative bg-surface-container flex items-center justify-center">
                    {activeProduct.images[0] ? (
                      <Image
                        src={activeProduct.images[0].url || ''}
                        alt={activeProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      "No Img"
                    )}
                  </div>
                  <div className="p-3">
                    <Link
                      href={`/product/${activeProduct.id}`}
                      className="text-sm font-bold text-on-surface leading-tight hover:text-primary transition-colors block mb-2 line-clamp-2"
                    >
                      {activeProduct.name}
                    </Link>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold text-base">
                        {formatPrice(
                          activeProduct.variants.find((v) => v.is_featured)?.price ??
                            activeProduct.variants[0]?.price ??
                            0,
                        )}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-medium px-2 py-0.5 bg-surface-container-high rounded-full border border-outline-variant/20">
                        Chưa bán
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center bg-surface-container-low rounded-xl border border-outline-variant/20 mb-5 text-on-surface-variant text-xs">
                  Không có sản phẩm đính kèm.
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="font-headline text-[11px] font-bold uppercase tracking-wider text-outline mb-3">
                    Người giao dịch
                  </h3>
                  <div className="flex items-center gap-2.5 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-outline-variant/30 bg-surface-container flex items-center justify-center font-bold">
                      {activeContact?.avatar?.url ? (
                        <Image src={activeContact.avatar.url} alt={activeContact.name} fill className="object-cover" />
                      ) : (
                        activeContact?.name.charAt(0) || "U"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-on-surface text-xs truncate">
                        {activeContact?.name || "Người dùng"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    className="rounded-lg shadow-sm font-bold py-2 text-xs"
                    onClick={() => {
                      if (activeProduct && activeConv) {
                        setIsOfferModalOpen(true);
                      }
                    }}
                  >
                    Đề nghị giá
                  </Button>
                  <button className="w-full py-2 bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-lg font-bold text-xs hover:bg-secondary-container/80 transition-colors">
                    Đánh dấu đã bán
                  </button>
                  <button className="w-full py-2 border border-outline/40 text-on-surface-variant rounded-lg font-bold text-xs hover:bg-surface-container transition-colors">
                    Chặn người dùng
                  </button>
                </div>

                <div className="pt-5 border-t border-outline-variant/30">
                  <h3 className="font-headline text-[11px] font-bold uppercase tracking-wider text-outline mb-3">
                    Mẹo an toàn
                  </h3>
                  <div className="bg-primary-container/10 p-3.5 rounded-xl border border-primary/10">
                    <p className="text-[11px] leading-relaxed text-on-surface-variant">
                      ShopNexus khuyến nghị thanh toán qua hệ thống để được bảo vệ quyền lợi 100%. Không nên chuyển khoản trực tiếp trước khi nhận hàng.
                    </p>
                    <Link
                      href="/help/safety"
                      className="text-primary text-[11px] font-bold mt-1.5 inline-block hover:underline"
                    >
                      Xem thêm →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span></div>}>
      <InboxContent />
    </Suspense>
  );
}
