"use client";

import React, { useState } from "react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  category: "orders" | "promotions" | "account";
  title: string;
  time: string;
  unread: boolean;
  timeGroup: "today" | "yesterday";
  content: React.ReactNode;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  avatar?: string;
  action?: {
    label: string;
    href: string;
    style: "primary" | "secondary" | "outline";
  };
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    category: "orders",
    title: "Đơn hàng đang giao đến bạn",
    time: "2 phút trước",
    unread: true,
    timeGroup: "today",
    content: (
      <>
        Đơn hàng <span className="font-semibold text-primary">#SN-92841</span> (Túi da Vintage thủ công) đang trên đường giao bởi đơn vị vận chuyển. Dự kiến giao thành công trước 17:00 hôm nay.
      </>
    ),
    icon: "package_2",
    iconBg: "bg-secondary-container",
    iconColor: "text-on-secondary-container",
    action: {
      label: "Theo dõi đơn",
      href: "/order/SN-92841",
      style: "primary",
    },
  },
  {
    id: "2",
    category: "orders",
    title: "Tin nhắn mới từ Minh Anh",
    time: "15 phút trước",
    unread: true,
    timeGroup: "today",
    content: (
      <>
        &ldquo;Chào bạn! Mình vừa gửi gói hàng cho bên vận chuyển rồi nhé. Bạn chú ý điện thoại khi shipper gọi giao hàng giúp mình nha!&rdquo;
      </>
    ),
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    action: {
      label: "Trả lời ngay",
      href: "/inbox",
      style: "secondary",
    },
  },
  {
    id: "3",
    category: "promotions",
    title: "Thông báo giảm giá sản phẩm",
    time: "2 giờ trước",
    unread: false,
    timeGroup: "today",
    content: (
      <>
        Sản phẩm trong danh sách yêu thích của bạn <span className="font-semibold text-tertiary">Bình gốm sứ tối giản</span> vừa giảm giá 15%. Mua ngay trước khi hết hàng!
      </>
    ),
    icon: "trending_down",
    iconBg: "bg-tertiary-container",
    iconColor: "text-on-tertiary-container",
    action: {
      label: "Xem sản phẩm",
      href: "/product/1",
      style: "outline",
    },
  },
  {
    id: "4",
    category: "account",
    title: "Người theo dõi mới",
    time: "5 giờ trước",
    unread: false,
    timeGroup: "today",
    content: (
      <>
        <span className="font-semibold">Thanh Hằng</span> và 3 người khác đã bắt đầu theo dõi bộ sưu tập &ldquo;Phong cách tối giản hiện đại&rdquo; của bạn.
      </>
    ),
    icon: "person_add",
    iconBg: "bg-surface-container-highest",
    iconColor: "text-on-surface-variant",
  },
  {
    id: "5",
    category: "account",
    title: "Cập nhật bảo mật tài khoản",
    time: "1 ngày trước",
    unread: false,
    timeGroup: "yesterday",
    content: (
      <>
        Mật khẩu của bạn đã được cập nhật thành công. Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức.
      </>
    ),
    icon: "verified_user",
    iconBg: "bg-surface-container-high",
    iconColor: "text-outline",
  },
];

export default function NotificationsPage(): React.ReactElement {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<"all" | "orders" | "promotions" | "account">("all");

  const categories = [
    { id: "all" as const, label: "Tất cả", icon: "grid_view" },
    { id: "orders" as const, label: "Đơn hàng", icon: "local_shipping" },
    { id: "promotions" as const, label: "Khuyến mãi", icon: "sell" },
    { id: "account" as const, label: "Tài khoản", icon: "account_circle" },
  ];

  const filteredNotifications = notifications.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  const todayNotifications = filteredNotifications.filter((item) => item.timeGroup === "today");
  const yesterdayNotifications = filteredNotifications.filter((item) => item.timeGroup === "yesterday");

  const unreadCount = notifications.filter((item) => item.unread).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 md:px-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Navigation Categories */}
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
            {categories.map((cat) => {
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

          <div className="p-5 bg-primary-container/10 rounded-2xl border border-primary/15">
            <p className="text-body-sm text-primary font-bold mb-1.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Cài đặt thông báo</span>
            </p>
            <p className="text-body-xs text-on-surface-variant opacity-90 mb-4 leading-relaxed">
              Quản lý cách bạn nhận cảnh báo qua email, trình duyệt và thiết bị di động.
            </p>
            <button
              type="button"
              className="text-label-sm text-primary font-extrabold hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Tùy chỉnh ngay</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </aside>

        {/* Center Column: Notification Feed */}
        <section className="md:col-span-8 lg:col-span-9 space-y-6">
          <div className="flex justify-between items-center px-2 pb-2 border-b border-outline-variant/20">
            <span className="text-label-sm font-bold uppercase tracking-widest text-outline">
              Hoạt động gần đây ({filteredNotifications.length})
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-label-sm text-primary font-bold hover:opacity-75 transition-opacity cursor-pointer flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>Đánh dấu đã đọc tất cả</span>
              </button>
            )}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-outline/50">notifications_off</span>
              <p className="text-body-lg font-bold text-on-surface">Không có thông báo nào</p>
              <p className="text-body-sm text-on-surface-variant">Bạn đã đọc hết mọi thông báo trong mục này!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Today Group */}
              {todayNotifications.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-2 text-label-xs font-bold uppercase tracking-widest text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    <span>Hôm nay</span>
                  </div>
                  <div className="space-y-3">
                    {todayNotifications.map((item) => (
                      <NotificationCard key={item.id} item={item} onRead={markAsRead} />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday Group */}
              {yesterdayNotifications.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 px-2 text-label-xs font-bold uppercase tracking-widest text-outline">
                    <span>Hôm qua</span>
                  </div>
                  <div className="space-y-3">
                    {yesterdayNotifications.map((item) => (
                      <NotificationCard key={item.id} item={item} onRead={markAsRead} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NotificationCard({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}): React.ReactElement {
  return (
    <div
      onClick={() => onRead(item.id)}
      className={`p-5 rounded-2xl border transition-all duration-300 flex gap-4 relative group cursor-pointer ${
        item.unread
          ? "bg-surface-container-lowest border-primary/30 shadow-md shadow-primary/5 hover:border-primary/60 scale-[1.002]"
          : "bg-surface border-outline-variant/20 opacity-85 hover:opacity-100 hover:bg-surface-container-lowest/60"
      }`}
    >
      {item.unread && (
        <div className="w-2.5 h-2.5 bg-primary rounded-full absolute right-5 top-5 animate-pulse" title="Chưa đọc" />
      )}

      {/* Icon or Avatar */}
      <div className="shrink-0">
        {item.avatar ? (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
            <img src={item.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className={`w-12 h-12 rounded-2xl ${
              item.iconBg || "bg-surface-container"
            } flex items-center justify-center shadow-sm`}
          >
            <span className={`material-symbols-outlined text-[24px] ${item.iconColor || "text-on-surface"}`}>
              {item.icon || "notifications"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0 pr-6">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className={`font-headline text-body-md font-extrabold text-on-surface ${item.unread ? "text-primary" : ""}`}>
            {item.title}
          </h3>
          <span className="text-label-xs text-outline font-medium shrink-0 whitespace-nowrap">{item.time}</span>
        </div>
        <p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-3">{item.content}</p>

        {item.action && (
          <div className="mt-3.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Link
              href={item.action.href}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-sm font-bold transition-all shadow-sm ${
                item.action.style === "primary"
                  ? "bg-primary text-on-primary hover:opacity-90 hover:scale-105"
                  : item.action.style === "secondary"
                  ? "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80"
                  : "bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary/50"
              }`}
            >
              <span>{item.action.label}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
