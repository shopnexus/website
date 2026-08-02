"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";

export default function PushDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const res = await AccountService.getPushDevices();
      setDevices(res.data || []);
    } catch (error) {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

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
          {devices.map((device, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">
                    {device.type === 'ios' || device.type === 'android' ? 'smartphone' : 'computer'}
                  </span>
                </div>
                <div>
                  <div className="font-label-md font-semibold text-on-surface capitalize">{device.name || "Thiết bị không tên"}</div>
                  <div className="font-body-sm text-on-surface-variant">Đăng ký ngày {new Date(device.created_at).toLocaleDateString('vi-VN')}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-error border-error hover:bg-error/10">
                Xóa
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
