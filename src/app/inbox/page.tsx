"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { mockConversationPage, mockMessagePage } from "@/lib/mocks/chat.mock";
import { mockListingDetail } from "@/lib/mocks/catalog.mock";
import type { Message } from "@/types/chat.type";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeConvId, setActiveConvId] = useState(mockConversationPage.items[0]?.id || "");
  const [messages, setMessages] = useState<Message[]>(mockMessagePage.items);
  const [inputText, setInputText] = useState("");
  const [showChatMobile, setShowChatMobile] = useState(false);

  // Mock resolve
  const activeConv = mockConversationPage.items.find((c) => c.id === activeConvId) || mockConversationPage.items[0];
  const activeContact = activeConv?.counterparty;
  const activeProduct = mockListingDetail; // mocked product

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: "msg_" + Date.now(),
      conversation_id: activeConvId,
      sender_id: "usr_me",
      type: "user",
      body: inputText.trim(),
      created_at: new Date().toISOString(),
      status: 'sent',
      attachments: [],
      metadata: {}
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  const isMe = (senderId?: string | null) => senderId === "usr_me";

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] w-full">
      <div className="w-full h-[calc(100vh-76px)] overflow-hidden">
        <div className="flex h-full border-t border-outline-variant/30 relative w-full">
          
          {/* ── Left Sidebar: Conversation List ── */}
          <aside
            className={`w-full md:w-[300px] lg:w-[320px] xl:w-[340px] 2xl:w-[360px] shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col h-full absolute md:relative z-20 transition-transform duration-300 ${
              showChatMobile ? "-translate-x-full md:translate-x-0" : "translate-x-0"
            }`}
          >
            <div className="p-4 border-b border-outline-variant/20 shrink-0">
              <h1 className="text-base font-bold text-on-surface mb-3 flex items-center justify-between">
                <span>Hộp thư</span>
                <span className="text-[11px] font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/30">
                  {mockConversationPage.items.length} hội thoại
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

            {/* Filter Tabs */}
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

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
              {mockConversationPage.items.map((conv) => {
                const isActive = activeConvId === conv.id;
                const contact = conv.counterparty;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
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

          {/* ── Center Pane: Active Chat Window ── */}
          <section className="flex-1 flex flex-col bg-surface overflow-hidden min-w-0 relative z-10">
            
            {/* Chat Header */}
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
                  <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-green-600 font-medium">Đang hoạt động</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-1.5">
                <button title="Gọi điện" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-surface-container-low rounded-full text-[20px]">
                  phone
                </button>
                <button title="Gọi video" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-surface-container-low rounded-full text-[20px]">
                  videocam
                </button>
              </div>
            </div>

            {/* Messages Display */}
            <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 bg-[url('https://www.transparenttextures.com/patterns/tiny-grid.png')] bg-surface-container-lowest/50">
              <div className="flex justify-center">
                <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-medium rounded-full shadow-2xs">
                  Hôm nay
                </span>
              </div>

              {messages.map((msg) => {
                const sentByMe = isMe(msg.sender_id);
                return (
                  <div key={msg.id} className="space-y-1">
                    {sentByMe ? (
                      /* Message Outgoing (User - Teal) */
                      <div className="flex flex-row-reverse gap-2.5 ml-auto max-w-[85%] md:max-w-[75%]">
                        <div className="flex flex-col items-end space-y-1.5 min-w-0">
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="rounded-xl rounded-br-sm overflow-hidden border-2 border-primary/20 shadow-sm max-w-[220px]">
                              <Image
                                src={msg.attachments[0].url || ''}
                                alt="Attached image"
                                width={240}
                                height={180}
                                className="w-full aspect-[4/3] object-cover"
                              />
                            </div>
                          )}

                          {msg.body && (
                            <div className="bg-primary text-on-primary px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl rounded-br-sm text-xs md:text-sm shadow-sm leading-relaxed break-words">
                              {msg.body}
                            </div>
                          )}

                          <span className="text-[9px] text-outline mt-0.5 block text-right flex items-center justify-end gap-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Message Incoming (Other Person) */
                      <div className="flex gap-2.5 max-w-[85%] md:max-w-[75%]">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden self-end mb-4 shrink-0 border border-outline-variant/30 bg-surface-container flex items-center justify-center text-xs">
                          {activeContact?.avatar?.url ? (
                            <Image src={activeContact.avatar.url} alt="" fill className="object-cover" />
                          ) : (
                            activeContact?.name.charAt(0) || "U"
                          )}
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="rounded-xl rounded-bl-sm overflow-hidden border border-outline-variant/40 shadow-sm max-w-[220px]">
                              <Image
                                src={msg.attachments[0].url || ''}
                                alt="Attached image"
                                width={240}
                                height={180}
                                className="w-full aspect-[4/3] object-cover"
                              />
                            </div>
                          )}

                          {msg.body && (
                            <div className="bg-surface-container-high text-on-surface px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl rounded-bl-sm text-xs md:text-sm shadow-sm leading-relaxed break-words border border-outline-variant/20">
                              {msg.body}
                            </div>
                          )}

                          <span className="text-[9px] text-outline mt-0.5 block pl-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chat Input Area */}
            <div className="p-3 md:p-4 bg-surface border-t border-outline-variant/30 shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-1.5 md:p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
                <button
                  type="button"
                  title="Đính kèm file"
                  className="material-symbols-outlined text-outline hover:text-primary p-1.5 transition-colors rounded-full hover:bg-surface-container-low shrink-0 text-[20px]"
                >
                  add_circle
                </button>
                <button
                  type="button"
                  title="Gửi hình ảnh"
                  className="material-symbols-outlined text-outline hover:text-primary p-1.5 transition-colors rounded-full hover:bg-surface-container-low shrink-0 text-[20px]"
                >
                  image
                </button>
                <input
                  className="flex-1 border-none focus:ring-0 bg-transparent text-xs md:text-sm py-1.5 outline-none text-on-surface placeholder:text-outline"
                  placeholder={`Viết tin nhắn cho ${activeContact?.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputText.trim()) {
                      handleSend();
                    }
                  }}
                  type="text"
                />
                <button
                  onClick={handleSend}
                  type="button"
                  title="Gửi tin nhắn"
                  disabled={!inputText.trim()}
                  className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 shadow-sm ${
                    inputText.trim()
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
          </section>

          {/* ── Right Sidebar: Product Context & Transaction Info ── */}
          <aside className="hidden lg:flex w-[280px] xl:w-[300px] 2xl:w-[320px] flex-col bg-surface-container-lowest border-l border-outline-variant/30 overflow-y-auto no-scrollbar shrink-0">
            <div className="p-4 md:p-5">
              <h3 className="font-headline text-[11px] font-bold uppercase tracking-wider text-outline mb-4">
                Chi tiết sản phẩm
              </h3>

              {activeProduct ? (
                <div className="rounded-xl overflow-hidden bg-surface-container-low mb-5 group cursor-pointer border border-outline-variant/20 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                  <div className="aspect-[4/3] overflow-hidden relative bg-surface-container flex items-center justify-center">
                    {activeProduct.images?.[0] ? (
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
                        {formatPrice(activeProduct.skus?.[0]?.price || 0)}
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

              {/* Seller/Buyer Profile Info */}
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

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    className="rounded-lg shadow-sm font-bold py-2 text-xs"
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
