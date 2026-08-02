"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";

export default function LinkedProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      const res = await AccountService.getOAuthIdentities();
      // Remove mock data handling - expecting actual data array
      setProviders(res.data || []);
    } catch (error) {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleUnlink = async (provider: string) => {
    try {
      await AccountService.unlinkProvider(provider);
      toast.success(`Đã hủy liên kết với ${provider}`);
      fetchProviders();
    } catch (error) {
      // Handled by interceptor
    }
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
      <h2 className="font-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">link</span>
        Tài khoản liên kết
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center p-6 bg-surface-container-lowest rounded-lg border border-outline-variant border-dashed text-on-surface-variant font-body-sm">
          Bạn chưa liên kết tài khoản mạng xã hội nào.
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {p.provider === "google" ? (
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
                  )}
                </div>
                <div>
                  <div className="font-label-md font-semibold text-on-surface capitalize">{p.provider}</div>
                  <div className="font-body-sm text-on-surface-variant">{p.email || "Đã liên kết"}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleUnlink(p.provider)}>
                Hủy liên kết
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
