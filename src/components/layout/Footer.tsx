"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const emptySubscribe = () => () => {};

export default function Footer() {
  const pathname = usePathname();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (isClient && (pathname?.startsWith("/inbox") || pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password") || pathname?.startsWith("/reset-password"))) {
    return null;
  }

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-auto">
      <div className="max-w-[1440px] mx-auto py-8 md:py-12 px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 text-headline-sm leading-7 text-on-surface hover:text-primary transition-colors group">
            <img
              src="/logo.png"
              alt="ShopNexus Logo"
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span>ShopNexus</span>
          </Link>

      <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-label-md leading-4 text-on-surface-variant">
            <Link href="/about" className="hover:text-primary transition-colors">
              Về chúng tôi
            </Link>
            <Link href="/help" className="hover:text-primary transition-colors">
              Trợ giúp
            </Link>
            <Link href="/inbox?tab=support" className="hover:text-primary transition-colors">
              Hỗ trợ
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">
              Cookie
            </Link>
          </div>

      <div className="text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} ShopNexus C2C Marketplace.
          </div>
        </div>
      </div>
    </footer>
  );
}
