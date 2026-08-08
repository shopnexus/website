"use client";

import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useOAuthIdentities, useUnlinkProvider } from "@/hooks/api/useAccount";

export default function LinkedProviders() {
  const { data: providers = [], isLoading } = useOAuthIdentities();
  const unlink = useUnlinkProvider();

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
          {providers.map((identity) => (
            <div key={identity.provider} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {identity.provider === "google" ? (
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
                  )}
                </div>
                <div>
                  <div className="font-label-md font-semibold text-on-surface capitalize">{identity.provider}</div>
                  {/* The provider's email is not returned — a linked identity is only
                      the provider and when it was linked. */}
                  <div className="font-body-sm text-on-surface-variant">
                    Liên kết ngày {new Date(identity.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={unlink.isPending}
                onClick={() =>
                  unlink.mutate(identity.provider, {
                    onSuccess: () => toast.success(`Đã hủy liên kết với ${identity.provider}.`),
                  })
                }
              >
                Hủy liên kết
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
