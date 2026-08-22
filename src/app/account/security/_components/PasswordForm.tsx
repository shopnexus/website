"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { useChangePassword } from "@/hooks/api/useAccount";
import { toast } from "react-hot-toast";

export default function PasswordForm() {
  const user = useAuthStore((s) => s.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useChangePassword();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    // Checked here rather than server-side because the confirmation field is a UI
    // affordance: the API takes one new password and has no second one to compare.
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải dài ít nhất 8 ký tự.");
      return;
    }

    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          toast.success("Đổi mật khẩu thành công. Các phiên đăng nhập khác đã bị hủy.");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6 h-fit">
      <h2 className="text-title-md text-on-surface mb-5 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">password</span>
        Đổi mật khẩu
      </h2>
      
      {!user?.has_password ? (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary-container/20 text-body-sm text-on-surface-variant">
          Tài khoản của bạn được đăng nhập bằng dịch vụ bên ngoài nên không có mật khẩu. Nếu muốn tạo mật khẩu, hãy đặt lại mật khẩu từ trang Đăng nhập.
        </div>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-label-md text-on-surface mb-1.5">Mật khẩu hiện tại</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-label-md text-on-surface mb-1.5">Mật khẩu mới</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-label-md text-on-surface mb-1.5">Xác nhận mật khẩu mới</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-body-md outline-none transition-colors focus:border-primary"
              required
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={changePassword.isPending} fullWidth>
              {changePassword.isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
