"use client";

import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useOAuthIdentities, useUnlinkProvider } from "@/hooks/api/useAccount";

export default function LinkedProviders() {
  const { data: providers = [], isLoading } = useOAuthIdentities();
  const unlink = useUnlinkProvider();

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
      <h2 className="text-title-md text-on-surface mb-5 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">link</span>
        Tài khoản liên kết
      </h2>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          icon="link_off"
          title="Chưa liên kết tài khoản nào"
          description="Đăng nhập một lần bằng Google để liên kết, sau đó bạn vào ShopNexus mà không cần nhập mật khẩu."
        />
      ) : (
        <div className="space-y-4">
          {providers.map((identity) => (
            <div key={identity.provider} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-outline-variant bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {identity.provider === "google" ? (
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
                  )}
                </div>
                <div>
                  <div className="text-label-md text-on-surface capitalize">{identity.provider}</div>
                  {/* The provider's email is not returned — a linked identity is only
                      the provider and when it was linked. */}
                  <div className="text-body-sm text-on-surface-variant">
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
