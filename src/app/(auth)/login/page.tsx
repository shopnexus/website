"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim()) {
      return toast.error("Vui lòng nhập Email, Số điện thoại hoặc Username.");
    }
    if (!password.trim()) {
      return toast.error("Vui lòng nhập mật khẩu.");
    }

    try {
      await login({ identifier, password });
      router.push("/");
    } catch (err: any) {
      if (err?.code === "invalid_credentials") {
        toast.error("Thông tin đăng nhập không chính xác.");
      } else {
        toast.error(err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 py-12 relative z-10">
      {/* Split-Screen Auth Container */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-surface-container-lowest rounded-xl overflow-hidden shadow-lg shadow-black/5 border border-outline-variant/50">
        
        {/* Branding/Image Side (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 relative items-center justify-center bg-primary overflow-hidden min-h-[600px]">
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5qIqlhDoZ2wjN18demXNu7wgtLEc_bzHfUbfW88M9p7MVftnwUufmLTQwYFS-0SdimMzZfvL2MGJK0ktmhmK5qlNzZ5DH2NpXH1g4-EL-MJsycCvQYs2PQnS1pa8I9Jdde_iRkhh5S7wdQIyjmuNtHospjv4vc8YmrVssjchqdIFl2QImC9s_VU5vXhWeje17IfVHxeJBIi8jIh9u4WUdbBRZUyMEYM_5SN8OdF62I0HPZ4VWXP8O')" }}
          />
          <div className="relative z-10 p-12 text-center">
            <h1 className="text-display-lg-mobile md:text-display-lg text-on-primary mb-4 font-extrabold tracking-tight">
              Cộng đồng là cốt lõi.
            </h1>
            <p className="text-body-lg text-primary-fixed max-w-md mx-auto">
              Chào mừng bạn trở lại ShopNexus. Đăng nhập an toàn để tiếp tục hành trình mua sắm của bạn.
            </p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-on-primary"></div>
              <div className="w-2 h-2 rounded-full bg-on-primary/40"></div>
              <div className="w-2 h-2 rounded-full bg-on-primary/40"></div>
            </div>
          </div>
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
        </div>

        {/* Form Side */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <header className="mb-10 text-center md:text-left">
              <h2 className="text-headline-md font-extrabold text-on-surface mb-2">Chào Mừng Trở Lại</h2>
              <p className="text-on-surface-variant text-body-md">Đăng nhập vào tài khoản của bạn để khám phá ShopNexus.</p>
            </header>

            {/* Social Login Cluster */}
            <div className="mb-8">
              <GoogleLoginButton text="Đăng nhập với Google" loadingText="Đang đăng nhập..." />
            </div>

            <div className="relative mb-8 text-center">
              <span className="absolute inset-x-0 top-1/2 h-px bg-outline-variant -z-10"></span>
              <span className="bg-surface-container-lowest px-4 text-label-sm text-on-surface-variant uppercase tracking-widest">hoặc đăng nhập bằng email</span>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div>
                <label htmlFor="identifier" className="block text-label-md text-on-surface-variant mb-2">Email, Số điện thoại hoặc Username</label>
                <input 
                  type="text" 
                  id="identifier" 
                  name="identifier" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full h-12 px-4 bg-surface rounded-lg border border-outline focus:border-2 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-label-md text-on-surface-variant">Mật khẩu</label>
                  <Link href="/forgot-password" className="text-label-sm text-primary font-bold hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    name="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-12 px-4 pr-12 bg-surface rounded-lg border border-outline focus:border-2 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-5 h-5 rounded border-outline text-primary focus:ring-primary-container bg-surface cursor-pointer" 
                />
                <label htmlFor="remember" className="ml-2 text-body-sm text-on-surface-variant select-none cursor-pointer">
                  Duy trì đăng nhập trong 30 ngày
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-primary text-on-primary rounded-lg font-bold text-label-md active:scale-[0.98] transition-all shadow-md hover:bg-primary-container flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                {!isLoading && <span className="material-symbols-outlined">login</span>}
              </button>
            </form>

            {/* Footer Link */}
            <footer className="mt-8 text-center">
              <p className="text-body-sm text-on-surface-variant">
                Chưa có tài khoản? 
                <Link href="/register" className="text-primary font-bold hover:underline ml-1">
                  Đăng ký ngay
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
