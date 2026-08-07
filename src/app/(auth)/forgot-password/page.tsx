"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { requestPasswordReset, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      return toast.error("Vui lòng nhập Email hoặc Số điện thoại.");
    }
    
    try {
      await requestPasswordReset(identifier);
      setIsSuccess(true);
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center w-full min-h-screen px-6 relative overflow-hidden z-10 py-20">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '-3s' }} />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="w-full max-w-[440px]">
        {/* Central Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,78,71,0.04)] border border-outline-variant/30">
          
          {/* Back Action */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-200 mb-8 group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span className="text-label-md">Back to Sign In</span>
          </Link>
          
          {/* Title Section */}
          <div className="space-y-3 mb-10">
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Forgot access?</h1>
            <p className="text-on-surface-variant text-body-md leading-relaxed">
              Enter your credentials and we&apos;ll send a secure reset code to your registered device.
            </p>
          </div>
          
          {/* Form */}
          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label htmlFor="identifier" className="block text-label-md text-on-surface font-semibold ml-1">
                  Email or Phone Number
                </label>
                <div className="relative rounded-lg border border-outline transition-all duration-200 bg-surface-container-low group overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                  </div>
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
              </div>
              
              {/* CTA */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary text-on-primary text-label-md font-bold py-4 rounded-lg hover:bg-primary-container active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? "Sending..." : "Send Reset Code"}</span>
                {!isLoading && <span className="material-symbols-outlined text-md">send</span>}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-4xl">mark_email_read</span>
              </div>
              <div>
                <h3 className="text-title-lg font-bold text-on-surface mb-2">Check your inbox</h3>
                <p className="text-on-surface-variant text-body-md">
                  We&apos;ve sent a verification code to <strong>{identifier}</strong>. Please enter the code on the reset password page.
                </p>
              </div>
              <Link 
                href="/reset-password" 
                className="w-full bg-primary text-on-primary text-label-md font-bold py-4 rounded-lg hover:bg-primary-container active:scale-[0.98] transition-all duration-200 flex items-center justify-center mt-6"
              >
                Continue to Reset Password
              </Link>
            </div>
          )}
          
          {/* Security Assurance */}
          <div className="mt-10 flex items-start gap-3 p-4 bg-surface-container rounded-lg border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-container mt-0.5">verified_user</span>
            <div className="space-y-1">
              <p className="text-label-sm font-bold text-on-surface">Human-Centric Security</p>
              <p className="text-label-sm text-on-surface-variant leading-tight">
                Your data is encrypted. We never share your contact details for marketing during the recovery process.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer Meta */}
        <footer className="mt-8 text-center">
          <p className="text-on-surface-variant text-body-sm">
            Having trouble? <Link href="/support" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">Contact Support</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
