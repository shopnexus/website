"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/api/useNotifications";
import type {
  NotificationCategory,
  NotificationChannel,
  NotificationPreference,
} from "@/api/generated/types.gen";
import { CATEGORY_LABELS } from "@/lib/notification-display";

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  "in-app": "Trong ứng dụng",
  push: "Thông báo đẩy",
  email: "Email",
  sms: "SMS",
};

/**
 * The grid is driven by the enums, not by whichever rows the server happened to return.
 *
 * A preference row only exists once it has been set explicitly — an unset combination
 * comes back as `is_default: true` or not at all — so deriving the axes from the response
 * would hide channels a user has never touched, which are exactly the ones they came to
 * turn on.
 */
const CATEGORIES: NotificationCategory[] = ["order", "chat", "promotion", "social", "system"];
const CHANNELS: NotificationChannel[] = ["in-app", "push", "email", "sms"];

const keyOf = (category: NotificationCategory, channel: NotificationChannel) =>
  `${category}:${channel}`;

export default function NotificationSettingsPage() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const savePreferences = useUpdateNotificationPreferences();

  /** Toggles the user has flipped but not saved, keyed by category:channel. */
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const serverValues = useMemo(() => {
    const map = new Map<string, NotificationPreference>();
    for (const pref of preferences ?? []) map.set(keyOf(pref.category, pref.channel), pref);
    return map;
  }, [preferences]);

  const isEnabled = (category: NotificationCategory, channel: NotificationChannel) => {
    const key = keyOf(category, channel);
    return pending[key] ?? serverValues.get(key)?.is_enabled ?? false;
  };

  const toggle = (category: NotificationCategory, channel: NotificationChannel) => {
    const key = keyOf(category, channel);
    setPending((prev) => ({ ...prev, [key]: !isEnabled(category, channel) }));
  };

  const handleSave = () => {
    // Only what changed. The server replaces the rows it is given and leaves the rest
    // inherited, so sending the whole grid would freeze every untouched default into an
    // explicit choice.
    const items = Object.entries(pending).map(([key, is_enabled]) => {
      const [category, channel] = key.split(":") as [NotificationCategory, NotificationChannel];
      return { category, channel, is_enabled };
    });

    if (items.length === 0) {
      toast("Không có thay đổi nào để lưu.");
      return;
    }

    savePreferences.mutate(
      { items },
      {
        onSuccess: () => {
          toast.success("Đã lưu cài đặt thông báo.");
          setPending({});
        },
      },
    );
  };

  const hasChanges = Object.keys(pending).length > 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline-md font-bold text-on-surface mb-2">Cài đặt thông báo</h1>
        <p className="font-body-sm text-on-surface-variant">Quản lý cách bạn nhận thông báo từ ShopNexus.</p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {CATEGORIES.map((category) => (
              <div key={category} className="p-6">
                <h3 className="font-headline-sm font-bold text-on-surface mb-4">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="space-y-4">
                  {CHANNELS.map((channel) => {
                    const pref = serverValues.get(keyOf(category, channel));
                    return (
                      <div key={channel} className="flex items-center justify-between">
                        <div className="font-body-md text-on-surface flex items-center gap-2">
                          {CHANNEL_LABELS[channel]}
                          {pref?.is_default && (
                            <span className="text-[11px] text-on-surface-variant border border-outline-variant rounded px-1.5 py-0.5">
                              mặc định
                            </span>
                          )}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isEnabled(category, channel)}
                            onChange={() => toggle(category, channel)}
                          />
                          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-end">
            <Button onClick={handleSave} disabled={savePreferences.isPending || !hasChanges}>
              {savePreferences.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
