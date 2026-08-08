"use client";

import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
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
    <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
      <h2 className="font-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">devices</span>
        Thiết bị nhận thông báo (Push)
      </h2>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center p-6 bg-surface-container-lowest rounded-lg border border-outline-variant border-dashed text-on-surface-variant font-body-sm">
          Chưa có thiết bị nào đăng ký nhận thông báo đẩy.
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">{platformIcon(device.platform)}</span>
                </div>
                <div>
                  <div className="font-label-md font-semibold text-on-surface">
                    {PLATFORM_LABELS[device.platform]}
                    {/* The tail of the push token — the only thing that distinguishes
                        two installs on the same platform, since the whole token is a
                        delivery credential the server never returns. */}
                    <span className="ml-2 font-mono text-[11px] text-on-surface-variant">
                      ···{device.push_token_suffix}
                    </span>
                  </div>
                  <div className="font-body-sm text-on-surface-variant">
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
