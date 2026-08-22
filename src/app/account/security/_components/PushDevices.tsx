"use client";

import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useDeleteDevice, usePushDevices } from "@/hooks/api/useAccount";
import type { DevicePlatform } from "@/api/generated/types.gen";

const PLATFORM_LABELS: Record<DevicePlatform, string> = {
  ios: "iPhone / iPad",
  android: "Android",
  web: "Trình duyệt web",
};

const platformIcon = (platform: DevicePlatform) =>
  platform === "web" ? "computer" : "smartphone";

export default function PushDevices() {
  const { data: devices = [], isLoading } = usePushDevices();
  const deleteDevice = useDeleteDevice();

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
      <h2 className="text-title-md text-on-surface mb-5 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">devices</span>
        Thiết bị nhận thông báo (Push)
      </h2>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        </div>
      ) : devices.length === 0 ? (
        <EmptyState
          icon="notifications_off"
          title="Chưa có thiết bị nhận thông báo"
          description="Bật thông báo cho ShopNexus trên điện thoại hoặc trình duyệt của bạn, thiết bị đó sẽ xuất hiện ở đây."
        />
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-outline-variant bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">{platformIcon(device.platform)}</span>
                </div>
                <div>
                  <div className="text-label-md text-on-surface">
                    {PLATFORM_LABELS[device.platform]}
                    {/* The tail of the push token — the only thing that distinguishes
                        two installs on the same platform, since the whole token is a
                        delivery credential the server never returns. */}
                    <span className="ml-2 text-label-xs tabular-nums text-on-surface-variant">
                      ···{device.push_token_suffix}
                    </span>
                  </div>
                  <div className="text-body-sm text-on-surface-variant">
                    Hoạt động lần cuối {new Date(device.last_seen_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-error border-error hover:bg-error/10"
                disabled={deleteDevice.isPending}
                onClick={() =>
                  deleteDevice.mutate(device.id, {
                    onSuccess: () => toast.success("Đã gỡ thiết bị."),
                  })
                }
              >
                Xóa
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
