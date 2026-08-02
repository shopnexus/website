"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";

export default function PasswordForm() {
  const { user } = useAuthStore();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp.");
    }
    
    if (newPassword.length < 8) {
      return toast.error("Mật khẩu mới phải dài ít nhất 8 ký tự.");
    }

    setIsUpdatingPassword(true);
    try {
      await AccountService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Đổi mật khẩu thành công. Các phiên đăng nhập khác đã bị hủy.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      // Error handled by apiClient
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm h-fit">
      <h2 className="font-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">password</span>
        Đổi mật khẩu
      </h2>
      
      {!user?.has_password ? (
        <div className="p-4 bg-primary-container/20 rounded-lg border border-primary/20 text-on-surface-variant font-body-sm">
          Tài khoản của bạn được đăng nhập bằng dịch vụ bên ngoài nên không có mật khẩu. Nếu muốn tạo mật khẩu, hãy đặt lại mật khẩu từ trang Đăng nhập.
        </div>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Mật khẩu hiện tại</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
              required
            />
          </div>
          
          <div>
            <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Mật khẩu mới</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
              required
            />
          </div>
          
          <div>
            <label className="block font-label-sm font-semibold text-on-surface mb-1.5">Xác nhận mật khẩu mới</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
              required
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isUpdatingPassword} fullWidth>
              {isUpdatingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
