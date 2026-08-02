"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState("");

  const { confirmPasswordReset, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    
    if (password !== confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      await confirmPasswordReset({ token, new_password: password });
      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      // Error is handled in store
    }
  };

  const getStrengthScore = (val: string) => {
    let score = 0;
    if (val.length > 5) score++;
    if (val.length > 8) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const score = getStrengthScore(password);

  return (
    <main className="flex-grow flex items-center justify-center min-h-screen py-20 px-4 relative overflow-hidden z-10">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '-3s' }} />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[100px] opacity-60" />
      </div>

      <section className="w-full max-w-[480px] space-y-8 bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-xl shadow-black/5 border border-outline-variant/30">
        
        {/* Brand & Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container rounded-full text-on-primary-container mb-2">
            <span className="material-symbols-outlined text-3xl">
              {isSuccess ? "check_circle" : "lock_reset"}
            </span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            {isSuccess ? "Password Reset Successfully" : "Reset Password"}
          </h1>
          <p className="text-on-surface-variant text-body-md max-w-xs mx-auto">
            {isSuccess 
              ? "You will be redirected to the login page shortly." 
              : "Please enter the verification code sent to your email and your new password."}
          </p>
        </div>
        
        {!isSuccess && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {(error || localError) && (
              <div className="p-3 bg-error/10 text-error rounded-lg text-sm font-medium border border-error/20">
                {localError || error}
              </div>
            )}
            {/* Verification Code Field */}
          <div className="space-y-2">
            <label htmlFor="token" className="block text-label-md text-on-surface-variant px-1">
              Verification Code
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">key</span>
              </div>
              <input 
                type="text" 
                id="token" 
                name="token" 
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="6-digit code" 
                required 
                className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none placeholder:text-outline-variant font-medium tracking-[0.5em] text-center" 
              />
            </div>
          </div>
          
          {/* New Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-label-md text-on-surface-variant px-1">
              New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">lock</span>
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                id="password" 
                name="password" 
                placeholder="••••••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none placeholder:text-outline-variant" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            
            {/* Password Strength Meter */}
            <div className="flex gap-1 mt-2 px-1">
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level} 
                  className={`h-1 flex-grow rounded-full transition-colors ${
                    level <= score
                      ? score <= 2 ? 'bg-error' : score === 3 ? 'bg-secondary' : 'bg-primary'
                      : 'bg-surface-container-high'
                  }`} 
                />
              ))}
            </div>
          </div>
          
          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirm_password" className="block text-label-md text-on-surface-variant px-1">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </div>
              <input 
                type="password" 
                id="confirm_password" 
                name="confirm_password" 
                placeholder="••••••••••••" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none placeholder:text-outline-variant" 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || password !== confirmPassword || !password || !token}
            className="w-full py-4 px-6 bg-primary text-on-primary font-headline font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
            {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
        </form>
        )}
        
        <div className="pt-4 text-center">
          <Link href="/login" className="text-label-md text-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-all">
            Back to Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
