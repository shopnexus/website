"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [locale, setLocale] = useState("vi-VN");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [terms, setTerms] = useState(false);

  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) return;
    
    const isEmail = identifier.includes("@");
    const payload = {
      name: displayName,
      username,
      password,
      locale,
      timezone,
      ...(isEmail ? { email: identifier } : { phone: identifier }),
    };

    try {
      await register(payload);
      router.push("/");
    } catch (err) {
      // Lỗi đã được lưu trong store
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-surface-container-lowest font-body">
      {/* Left Side: Branding / Image */}
      <div className="hidden md:flex w-1/2 relative flex-col justify-between bg-primary p-12 lg:p-16 text-on-primary overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-50"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5qIqlhDoZ2wjN18demXNu7wgtLEc_bzHfUbfW88M9p7MVftnwUufmLTQwYFS-0SdimMzZfvL2MGJK0ktmhmK5qlNzZ5DH2NpXH1g4-EL-MJsycCvQYs2PQnS1pa8I9Jdde_iRkhh5S7wdQIyjmuNtHospjv4vc8YmrVssjchqdIFl2QImC9s_VU5vXhWeje17IfVHxeJBIi8jIh9u4WUdbBRZUyMEYM_5SN8OdF62I0HPZ4VWXP8O')" }}
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="font-headline font-extrabold text-2xl tracking-tight text-white">ShopNexus</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg mt-auto mb-24">
          <h1 className="font-headline text-[3.5rem] leading-[1.1] font-extrabold text-white mb-6 tracking-tight">
            Join the future of<br/>human-centric<br/>commerce.
          </h1>
          <p className="font-body text-primary-fixed text-lg font-medium">
            Create an account to start curating your shop, discovering unique pieces, and connecting with a global community of makers.
          </p>
        </div>

        {/* Trust Indicator */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-variant overflow-hidden flex items-center justify-center">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Curator" className="w-full h-full object-cover" />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-variant overflow-hidden flex items-center justify-center">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="Curator" className="w-full h-full object-cover" />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-variant overflow-hidden flex items-center justify-center">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn" alt="Curator" className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="font-label text-sm font-bold tracking-wider uppercase text-white">
            TRUSTED BY 20K+ CURATORS
          </span>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full md:w-1/2 flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-24">
          <div className="w-full max-w-md mx-auto">
            <h2 className="font-headline text-[2.5rem] leading-tight font-extrabold text-on-surface mb-2">Create your account</h2>
            <p className="font-body text-on-surface-variant mb-10">
              Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email or Phone */}
              <div>
                <label htmlFor="identifier" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Email or Phone Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    id="identifier" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full h-12 px-4 pr-10 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline outline-none" 
                    required 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-[20px]">alternate_email</span>
                </div>
              </div>

              {/* Username & Display Name */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="username" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Username</label>
                  <input 
                    type="text" 
                    id="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@curator" 
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline outline-none" 
                    required 
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="displayName" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Display Name</label>
                  <input 
                    type="text" 
                    id="displayName" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Rivers" 
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline outline-none" 
                    required 
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-12 px-4 pr-10 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline outline-none" 
                    required 
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
                <p className="text-[11px] text-outline mt-2 font-medium">Must be at least 8 characters with a mix of letters and numbers.</p>
              </div>

              {/* Locale & Timezone */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="locale" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Locale (Region)</label>
                  <div className="relative">
                    <select 
                      id="locale" 
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                      className="w-full h-12 px-4 appearance-none rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface outline-none cursor-pointer"
                    >
                      <option value="vi-VN">Vietnam</option>
                      <option value="en-US">United States</option>
                      <option value="en-GB">United Kingdom</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="timezone" className="block font-label text-sm font-semibold text-on-surface mb-1.5">Timezone</label>
                  <div className="relative">
                    <select 
                      id="timezone" 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-12 px-4 appearance-none rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface outline-none cursor-pointer"
                    >
                      <option value="Asia/Ho_Chi_Minh">Indochina (ICT)</option>
                      <option value="America/Los_Angeles">Pacific (PST)</option>
                      <option value="America/New_York">Eastern (EST)</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>
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
                  I agree to the <Link href="/terms" className="text-on-surface font-semibold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-on-surface font-semibold hover:underline">Privacy Policy</Link>.
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-primary text-on-primary rounded-lg font-bold text-label-md active:scale-[0.98] transition-all shadow-md hover:bg-primary-container disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px bg-outline-variant/50 flex-1"></div>
              <span className="text-[11px] font-bold tracking-widest text-outline uppercase">OR REGISTER WITH</span>
              <div className="h-px bg-outline-variant/50 flex-1"></div>
            </div>

            {/* Social Buttons */}
            <div className="mb-8">
              <GoogleLoginButton text="Continue with Google" loadingText="Connecting..." />
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/30">
            <p className="text-[11px] text-outline font-medium">© 2024 ShopNexus. Human-centric commerce.</p>
            <div className="flex gap-6 text-[11px] text-outline font-medium">
              <Link href="/privacy" className="hover:text-on-surface transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-on-surface transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-on-surface transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
