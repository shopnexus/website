"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPreferences = async () => {
    try {
      const res = await AccountService.getNotificationPreferences();
      // Assume res.data is an array of preferences like { category: "order", channel: "push", enabled: true }
      setPreferences(res.data || []);
    } catch (error) {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleToggle = (category: string, channel: string, currentValue: boolean) => {
    const updated = preferences.map(p => 
      (p.category === category && p.channel === channel) ? { ...p, enabled: !currentValue } : p
    );
    setPreferences(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Structure based on UpdateNotificationPreferencesRequest
      const changes = preferences.map(p => ({
        category: p.category,
        channel: p.channel,
        enabled: p.enabled
      }));
      await AccountService.updateNotificationPreferences({ changes });
      toast.success("Đã lưu cài đặt thông báo.");
    } catch (error) {
      // Error handled
    } finally {
      setIsSaving(false);
    }
  };

  const categories = Array.from(new Set(preferences.map(p => p.category)));
  const channels = Array.from(new Set(preferences.map(p => p.channel)));

  const translateCategory = (cat: string) => {
    switch (cat) {
      case "order": return "Đơn hàng";
      case "chat": return "Tin nhắn";
      case "promotion": return "Khuyến mãi";
      case "account": return "Tài khoản";
      default: return cat;
    }
  };

  const translateChannel = (chan: string) => {
    switch (chan) {
      case "push": return "Thông báo đẩy";
      case "email": return "Email";
      case "sms": return "SMS";
      default: return chan;
    }
  };

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
        ) : preferences.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            Không thể tải cài đặt thông báo.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {categories.map(category => (
              <div key={category} className="p-6">
                <h3 className="font-headline-sm font-bold text-on-surface mb-4 capitalize">{translateCategory(category)}</h3>
                <div className="space-y-4">
                  {channels.map(channel => {
                    const pref = preferences.find(p => p.category === category && p.channel === channel);
                    if (!pref) return null;
                    
                    return (
                      <div key={channel} className="flex items-center justify-between">
                        <div className="font-body-md text-on-surface">{translateChannel(channel)}</div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={!!pref.enabled}
                            onChange={() => handleToggle(category, channel, pref.enabled)}
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
        
        {preferences.length > 0 && (
          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-end">
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
