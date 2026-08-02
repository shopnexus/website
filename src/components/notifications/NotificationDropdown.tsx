"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchBadge = async () => {
    try {
      const res = await AccountService.getNotificationBadge();
      setUnreadCount(res.data?.total || 0);
    } catch (e) {
      // Ignored
    }
  };

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const res = await AccountService.getNotifications(undefined, 5);
      setNotifications(res.data || []);
      
      // If there are unread notifications, mark them as read up to the latest one
      if (res.data && res.data.length > 0 && unreadCount > 0) {
        const latestTime = res.data[0].created_at;
        await AccountService.markNotificationsRead(latestTime);
        setUnreadCount(0); // Optimistic clear
      }
    } catch (e) {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadge();
    // In a real app, you might set up an interval or WebSocket to update the badge
    const interval = setInterval(fetchBadge, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFeed();
    }
  }, [isOpen]);

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
                {notifications.map((notif, idx) => (
                  <div key={idx} className="p-4 hover:bg-surface-container-lowest transition-colors cursor-pointer flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">info</span>
                    </div>
                    <div>
                      <div className="font-label-md font-semibold text-on-surface line-clamp-2">{notif.title || "Thông báo hệ thống"}</div>
                      <div className="font-body-sm text-on-surface-variant line-clamp-2 mt-0.5">{notif.body}</div>
                      <div className="text-[11px] text-on-surface-variant mt-1">
                        {new Date(notif.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
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
