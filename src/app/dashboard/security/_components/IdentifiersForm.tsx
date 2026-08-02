"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";

export default function IdentifiersForm() {
  const { user, fetchProfile } = useAuthStore();
  
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [username, setUsername] = useState(user?.username || "");
  const [isUpdatingId, setIsUpdatingId] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const handleUpdateIdentifiers = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingId(true);
    try {
      await AccountService.updateIdentifiers({
        email: email || null,
        phone: phone || null,
        username: username || null,
      });
      toast.success("Cập nhật thông tin định danh thành công.");
      await fetchProfile(); // Refresh store data
    } catch (error: any) {
      // Error handled by apiClient
    } finally {
      setIsUpdatingId(false);
    }
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
          {!user?.email_verified && user?.email && (
            <p className="text-error text-[11px] mt-1 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              Email chưa được xác minh
            </p>
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
          <Button type="submit" disabled={isUpdatingId} fullWidth>
            {isUpdatingId ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
