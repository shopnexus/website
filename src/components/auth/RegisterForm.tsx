"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { callbackUrlFromLocation, postLoginDestination } from "@/lib/post-login";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);

  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) return toast.error("Vui lòng nhập Tên hiển thị.");
    if (!username.trim()) return toast.error("Vui lòng nhập Username.");
    if (!identifier.trim()) return toast.error("Vui lòng nhập Email hoặc Số điện thoại.");
    if (!password.trim()) return toast.error("Vui lòng nhập Mật khẩu.");
    
    if (password.length < 8) {
      return toast.error("Mật khẩu phải dài ít nhất 8 ký tự.");
    }
    
    if (!terms) {
      return toast.error("Vui lòng đồng ý với các Điều khoản Dịch vụ.");
    }

    try {
      const isEmail = identifier.includes("@");
      const payload = {
        name: displayName,
        username,
        password,
        country: "VN",
        locale: "vi-VN",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(isEmail ? { email: identifier } : { phone: identifier }),
      };
      await register(payload);
      // A new account is never staff, but it can still have been sent here from a
      // protected route — the register link on the sign-in form carries the callback.
      router.replace(postLoginDestination(useAuthStore.getState().user?.role, callbackUrlFromLocation()));
    } catch (err) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Email or Phone */}
        <div>
          <label htmlFor="identifier" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Email hoặc Số điện thoại</label>
          <div className="relative">
            <input 
              type="text" 
              id="identifier" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@example.com" 
              className="w-full h-12 px-4 bg-surface rounded-lg border border-outline focus:border-2 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-[20px]">alternate_email</span>
          </div>
        </div>

        {/* Username & Display Name */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="username" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Tên đăng nhập</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="John Doe" 
              className="w-full h-12 px-4 bg-surface rounded-lg border border-outline focus:border-2 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
            />
          </div>
          <div className="flex-1">
            <label htmlFor="displayName" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Tên hiển thị</label>
            <input 
              type="text" 
              id="displayName" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Rivers" 
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline outline-none" 
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Mật khẩu</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full h-12 px-4 pr-12 bg-surface rounded-lg border border-outline focus:border-2 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          <p className="text-label-xs text-outline mt-2">Ít nhất 8 ký tự bao gồm chữ cái và chữ số.</p>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start pt-2">
          <div className="flex items-center h-5">
            <input 
              type="checkbox" 
              id="terms" 
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low cursor-pointer" 
              required 
            />
          </div>
          <label htmlFor="terms" className="ml-3 text-body-sm text-on-surface-variant cursor-pointer">
            Tôi đồng ý với <Link href="/terms" className="text-on-surface font-semibold hover:underline">Điều khoản Dịch vụ</Link> và <Link href="/privacy" className="text-on-surface font-semibold hover:underline">Chính sách Bảo mật</Link>.
          </label>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-14 bg-primary text-on-primary rounded-lg font-bold text-label-md active:scale-[0.98] transition-all shadow-md hover:bg-primary-container disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang xử lý..." : "Tạo Tài Khoản"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px bg-outline-variant/50 flex-1"></div>
        <span className="text-label-xs tracking-widest text-outline uppercase">HOẶC TIẾP TỤC VỚI</span>
        <div className="h-px bg-outline-variant/50 flex-1"></div>
      </div>

      {/* Social Buttons */}
      <div className="mb-8">
        <GoogleLoginButton text="Đăng ký bằng Google" loadingText="Đang kết nối..." />
      </div>
    </>
  );
}
