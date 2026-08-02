"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  useMarkNotificationsRead,
  useNotificationsFeed,
  useUnreadCount,
} from "@/hooks/api/useNotifications";
import type { Notification, NotificationCategory } from "@/api/generated/types.gen";
import { notificationBody, notificationHref } from "@/lib/notification-display";

type Category = "all" | NotificationCategory;

const CATEGORIES: Array<{ id: Category; label: string; icon: string }> = [
  { id: "all", label: "Tất cả", icon: "grid_view" },
  { id: "order", label: "Đơn hàng", icon: "local_shipping" },
  { id: "promotion", label: "Khuyến mãi", icon: "sell" },
  { id: "chat", label: "Tin nhắn", icon: "chat" },
  { id: "social", label: "Mạng xã hội", icon: "people" },
  { id: "system", label: "Hệ thống", icon: "settings" },
];

const CATEGORY_STYLES: Record<NotificationCategory, { icon: string; bg: string; color: string }> = {
  order: { icon: "package_2", bg: "bg-secondary-container", color: "text-on-secondary-container" },
  promotion: { icon: "trending_down", bg: "bg-tertiary-container", color: "text-on-tertiary-container" },
  chat: { icon: "chat_bubble", bg: "bg-primary-container", color: "text-on-primary-container" },
  social: { icon: "person_add", bg: "bg-surface-container-highest", color: "text-on-surface-variant" },
  system: { icon: "verified_user", bg: "bg-surface-container-high", color: "text-outline" },
};

export default function NotificationsPage(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const { notifications, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotificationsFeed({
      // "all" is the absence of a filter, not a category the server knows.
      category: activeCategory === "all" ? undefined : activeCategory,
      limit: 50,
    });

  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkNotificationsRead();

  const markAllAsRead = () => {
    // No bound: the server reads an omitted `before` as "the whole feed".
    markRead.mutate(undefined, {
      onSuccess: () => toast.success("Đã đánh dấu đọc tất cả"),
    });
  };

  const { today, older } = useMemo(() => {
    const todayStamp = new Date().toDateString();
    return {
      today: notifications.filter((n) => new Date(n.created_at).toDateString() === todayStamp),
      older: notifications.filter((n) => new Date(n.created_at).toDateString() !== todayStamp),
    };
  }, [notifications]);

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 md:px-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <aside className="md:col-span-4 lg:col-span-3 space-y-6">
          <div className="px-2">
            <h1 className="font-headline text-headline-sm font-extrabold text-on-surface flex items-center gap-2.5">
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <span className="text-label-xs font-bold bg-primary text-on-primary px-2.5 py-0.5 rounded-full animate-pulse">
                  {unreadCount} mới
                </span>
              )}
            </h1>
          </div>

          <nav className="space-y-1.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-secondary-container text-on-secondary-container shadow-sm scale-[1.01]"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {cat.icon}
                    </span>
                    <span className="text-body-md font-bold">{cat.label}</span>
                  </div>
                  {cat.id === "all" && unreadCount > 0 && (
                    <span className="text-label-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <Link href="/dashboard/notifications" className="block p-5 bg-primary-container/10 rounded-2xl border border-primary/15 hover:bg-primary-container/20 transition-colors">
            <p className="text-body-sm text-primary font-bold mb-1.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Cài đặt thông báo</span>
            </p>
            <p className="text-body-xs text-on-surface-variant opacity-90 mb-4 leading-relaxed">
              Quản lý cách bạn nhận cảnh báo qua email, trình duyệt và thiết bị di động.
            </p>
            <div className="text-label-sm text-primary font-extrabold hover:underline cursor-pointer inline-flex items-center gap-1">
              <span>Tùy chỉnh ngay</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </Link>
        </aside>

        <section className="md:col-span-8 lg:col-span-9 space-y-6">
          <div className="flex justify-between items-center px-2 pb-2 border-b border-outline-variant/20">
            <span className="text-label-sm font-bold uppercase tracking-widest text-outline">
              Hoạt động gần đây ({notifications.length})
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markRead.isPending}
                className="text-label-sm text-primary font-bold hover:opacity-75 transition-opacity cursor-pointer flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>Đánh dấu đã đọc tất cả</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-outline/50">notifications_off</span>
              <p className="text-body-lg font-bold text-on-surface">Không có thông báo nào</p>
              <p className="text-body-sm text-on-surface-variant">Bạn đã đọc hết mọi thông báo trong mục này!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {today.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-2 text-label-xs font-bold uppercase tracking-widest text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    <span>Hôm nay</span>
                  </div>
                  <div className="space-y-3">
                    {today.map((item) => (
                      <NotificationCard key={item.created_at} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {older.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 px-2 text-label-xs font-bold uppercase tracking-widest text-outline">
                    <span>Trước đó</span>
                  </div>
                  <div className="space-y-3">
                    {older.map((item) => (
                      <NotificationCard key={item.created_at} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant text-label-sm font-bold hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NotificationCard({ item }: { item: Notification }): React.ReactElement {
  // The server states this per row: read_at is null until the feed is marked read past
  // this notification's created_at.
  const isUnread = !item.read_at;
  const styleInfo = CATEGORY_STYLES[item.category];
  const body = notificationBody(item);
  const href = notificationHref(item);

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 flex gap-4 relative group cursor-pointer ${
        isUnread
          ? "bg-surface-container-lowest border-primary/30 shadow-md shadow-primary/5 hover:border-primary/60 scale-[1.002]"
          : "bg-surface border-outline-variant/20 opacity-85 hover:opacity-100 hover:bg-surface-container-lowest/60"
      }`}
    >
      {/* {isUnread && (
        <div className="w-2.5 h-2.5 bg-primary rounded-full absolute right-5 top-5 animate-pulse" title="Chưa đọc" />
      )} */}

      <div className="shrink-0">
        <div
          className={`w-12 h-12 rounded-2xl ${
            styleInfo.bg || "bg-surface-container"
          } flex items-center justify-center shadow-sm`}
        >
          <span className={`material-symbols-outlined text-[24px] ${styleInfo.color || "text-on-surface"}`}>
            {styleInfo.icon || "notifications"}
          </span>
        </div>
      </div>

      <div className="flex-grow min-w-0 pr-6">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className={`font-headline text-body-md font-extrabold text-on-surface ${isUnread ? "text-primary" : ""}`}>
            {item.title}
          </h3>
          <span className="text-label-xs text-outline font-medium shrink-0 whitespace-nowrap">
            {new Date(item.created_at).toLocaleString('vi-VN')}
          </span>
        </div>
        {body && (
          <p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-3">{body}</p>
        )}

        {href && (
          <div className="mt-3.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Link
              href={href}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-sm font-bold transition-all shadow-sm bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary/50`}
            >
              <span>Xem chi tiết</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
