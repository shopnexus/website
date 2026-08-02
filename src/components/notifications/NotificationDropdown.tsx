"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  useMarkNotificationsRead,
  useNotificationsFeed,
  useUnreadCount,
} from "@/hooks/api/useNotifications";
import { notificationBody, notificationIcon } from "@/lib/notification-display";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Polls once a minute while signed in, and stops entirely when signed out — the
  // endpoint needs a token, and polling it without one was a 401 a minute.
  const { data: unreadCount = 0 } = useUnreadCount({ enabled: isAuthenticated });

  // Only fetched once the dropdown is open. Five rows is all it renders.
  const { notifications, isLoading } = useNotificationsFeed({
    limit: 5,
    enabled: isOpen && isAuthenticated,
  });

  const markRead = useMarkNotificationsRead();

  // Opening the panel is the read receipt, marked up to the newest row shown rather
  // than to "now", so a notification that arrives mid-render is not silently swallowed.
  const newest = notifications[0]?.created_at;
  useEffect(() => {
    if (!isOpen || !newest || unreadCount === 0 || markRead.isPending) return;
    markRead.mutate(newest);
    // markRead is a stable mutation object apart from its pending flag, which is
    // guarded above; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, newest, unreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative pb-1 px-2 transition-all cursor-pointer flex items-center justify-center border-b-2 duration-300 ${
          isOpen ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isOpen ? "'FILL' 1" : "'FILL' 0" }}>
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-1 translate-x-1/2 -translate-y-1/2 bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-surface rounded-2xl shadow-lg border border-outline-variant overflow-hidden z-50">
          <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
            <h3 className="font-headline-sm font-bold text-on-surface">Thông báo</h3>
            <Link href="/dashboard/notifications" className="text-primary text-[12px] font-medium hover:underline">
              Cài đặt
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-body-sm">
                Không có thông báo nào.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {notifications.map((notif) => {
                  const body = notificationBody(notif);
                  return (
                    // created_at identifies the row together with the feed order, which
                    // is also what the read bound is expressed against.
                    <div key={notif.created_at} className="p-4 hover:bg-surface-container-lowest transition-colors cursor-pointer flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">{notificationIcon(notif.category)}</span>
                      </div>
                      <div>
                        <div className="font-label-md font-semibold text-on-surface line-clamp-2">{notif.title}</div>
                        {body && (
                          <div className="font-body-sm text-on-surface-variant line-clamp-2 mt-0.5">{body}</div>
                        )}
                        <div className="text-[11px] text-on-surface-variant mt-1">
                          {new Date(notif.created_at).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-outline-variant text-center bg-surface-container-lowest">
            <Link href="/notifications" className="text-primary font-label-sm font-bold hover:underline">
              Xem tất cả
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
