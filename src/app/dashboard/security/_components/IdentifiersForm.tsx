"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { useRequestEmailVerification, useUpdateIdentifiers } from "@/hooks/api/useAccount";
import { toast } from "react-hot-toast";
import type { UpdateAccountRequest } from "@/api/generated/types.gen";

/**
 * Build the patch for one identifier.
 *
 * Clearing is an explicit `clear_*` flag rather than a null value — the request type has
 * no nullable identifier fields, so sending `email: null` to erase an address is
 * rejected as malformed. Omitting a field leaves it untouched, which is what an
 * unchanged input should do.
 */
function identifierPatch<K extends "email" | "phone" | "username">(
  key: K,
  next: string,
  current: string | null | undefined,
): UpdateAccountRequest {
  const trimmed = next.trim();
  if (trimmed === (current ?? "")) return {};
  if (trimmed === "") return { [`clear_${key}`]: true } as UpdateAccountRequest;
  return { [key]: trimmed } as UpdateAccountRequest;
}

export default function IdentifiersForm() {
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [username, setUsername] = useState(user?.username || "");

  const updateIdentifiers = useUpdateIdentifiers();
  const requestEmailVerification = useRequestEmailVerification();

  // Loaded during render, keyed on the account id — see the same pattern in ProfileForm.
  // An effect would paint the inputs empty and fill them on a second pass, and keying on
  // the user object would clear whatever is typed every time the profile refreshes.
  const [loadedAccountId, setLoadedAccountId] = useState(user?.id);
  if (user && user.id !== loadedAccountId) {
    setLoadedAccountId(user.id);
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setUsername(user.username || "");
  }

  const handleUpdateIdentifiers = (e: React.FormEvent) => {
    e.preventDefault();

    const body: UpdateAccountRequest = {
      ...identifierPatch("username", username, user?.username),
      ...identifierPatch("email", email, user?.email),
      ...identifierPatch("phone", phone, user?.phone),
    };

    if (Object.keys(body).length === 0) {
      toast("Không có thay đổi nào để lưu.");
      return;
    }

    updateIdentifiers.mutate(body, {
      onSuccess: async () => {
        toast.success("Cập nhật thông tin định danh thành công.");
        // The zustand store holds its own copy of the account for the header and the
        // route guards; the query cache alone would leave it stale.
        await fetchProfile();
      },
    });
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
      <h2 className="font-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">badge</span>
        Thông tin định danh
      </h2>
      
      <form onSubmit={handleUpdateIdentifiers} className="space-y-4">
        <div>
          <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Tên đăng nhập (Username)</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
          />
        </div>
        
        <div>
          <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Địa chỉ Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
          />
          {/* Only offered for the address the server already holds: the request takes no
              body and reads the account's own email, so a freshly typed address has to be
              saved first or the message goes to the previous one. */}
          {!user?.email_verified && user?.email && (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <p className="text-error text-[11px] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                Email chưa được xác minh
              </p>
              <button
                type="button"
                disabled={requestEmailVerification.isPending}
                onClick={() =>
                  requestEmailVerification.mutate(undefined, {
                    onSuccess: () =>
                      toast.success("Đã gửi email xác minh. Mở hộp thư và bấm vào liên kết."),
                  })
                }
                className="text-primary text-[11px] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
              >
                {requestEmailVerification.isPending ? "Đang gửi..." : "Gửi lại email xác minh"}
              </button>
            </div>
          )}
        </div>
        
        <div>
          <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Số điện thoại</label>
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={updateIdentifiers.isPending} fullWidth>
            {updateIdentifiers.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
