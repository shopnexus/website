"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavbarScroll } from "@/hooks/useNavbarScroll";
import { useSearch } from "@/hooks/useSearch";
import { useAuthStore } from "@/stores/use-auth-store";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export default function Navbar(): React.ReactElement {
  const pathname = usePathname();
  const { isScrolledPastHero } = useNavbarScroll();
  const { query, setQuery, handleSearch } = useSearch();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const shouldShowSearchBar = pathname !== "/" || isScrolledPastHero;
  const isAuthPage = pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password") || pathname?.startsWith("/reset-password");

  if (isAuthPage) return <></>;

  return (
    <>
      <nav
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          isScrolledPastHero
            ? "bg-background/95 backdrop-blur-md border-b border-outline-variant/30 shadow-md"
            : "bg-background/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm"
        }`}
      >
        <div className="px-4 md:px-6 py-3.5 max-w-[1440px] mx-auto flex justify-between items-center gap-3 md:gap-4">
          <div className="flex items-center gap-6 md:gap-8 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 font-headline font-extrabold text-xl tracking-tighter text-primary shrink-0 group">
              <img
                src="/logo.png"
                alt="ShopNexus Logo"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span>ShopNexus</span>
            </Link>
            <div className={`${shouldShowSearchBar ? "hidden xl:flex" : "hidden md:flex"} items-center gap-6 transition-all duration-300`}>
              <Link
                href="/"
                className={`font-headline text-label-md uppercase tracking-wider font-bold pb-1 transition-colors duration-300 ${
                  pathname === "/"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Khám phá
              </Link>
              <Link
                href="/search"
                className={`font-headline text-label-md uppercase tracking-wider font-bold pb-1 transition-colors duration-300 ${
                  pathname?.startsWith("/search") || pathname?.startsWith("/shop")
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Sản phẩm
              </Link>
            </div>
          </div>

          <div
            className={`flex-1 transition-all duration-500 ease-out flex justify-center ${
              shouldShowSearchBar
                ? "max-w-lg opacity-100 scale-100 translate-y-0 mx-2 md:mx-4 pointer-events-auto"
                : "max-w-0 opacity-0 scale-95 -translate-y-3 mx-0 pointer-events-none overflow-hidden"
            }`}
          >
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-surface-container rounded-full px-3.5 md:px-4 py-1.5 w-full border border-outline-variant/30 focus-within:border-primary/50 focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0" aria-hidden="true">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm đồ cũ, thủ công, quà tặng..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 w-full text-body-sm text-on-surface placeholder:text-outline-variant outline-none min-w-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-on-surface-variant hover:text-on-surface flex items-center cursor-pointer shrink-0"
                  aria-label="Xóa từ khóa"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </form>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            {!mounted ? (
              <div className="w-32 h-10 bg-surface-variant/30 animate-pulse rounded-full"></div>
            ) : isAuthenticated ? (
              <>
                <NotificationDropdown />
                <Link
                  href="/cart"
                  aria-label="shopping_bag"
                  className={`pb-1 px-2 transition-all cursor-pointer flex items-center justify-center border-b-2 duration-300 ${
                    pathname === "/cart"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant border-transparent hover:text-primary"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: pathname === "/cart" ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    shopping_bag
                  </span>
                </Link>
                <Link
                  href="/inbox"
                  aria-label="chat_bubble"
                  className={`hidden sm:flex pb-1 px-2 transition-all cursor-pointer items-center justify-center border-b-2 duration-300 ${
                    pathname === "/inbox"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant border-transparent hover:text-primary"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: pathname === "/inbox" ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    chat_bubble
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  aria-label="person"
                  className={`hidden sm:flex pb-1 px-2 transition-all cursor-pointer items-center justify-center border-b-2 duration-300 ${
                    pathname === "/dashboard"
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant border-transparent hover:text-primary"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: pathname === "/dashboard" ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    person
                  </span>
                </Link>
                <Link
                  href="/sell"
                  aria-label="Tạo tin đăng mới"
                  className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1.5 rounded-full font-bold text-label-sm hover:opacity-90 transition-all shadow-sm shrink-0 cursor-pointer mr-0.5 md:mr-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span className="hidden sm:inline">Đăng tin</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="font-headline font-bold text-label-md text-on-surface hover:text-primary px-4 py-2 transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/register" className="font-headline font-bold text-label-md bg-primary text-on-primary px-5 py-2 rounded-full shadow-sm hover:opacity-90 transition-all">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {!pathname?.startsWith("/product") && !pathname?.startsWith("/checkout") && !pathname?.startsWith("/sell") && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3 bg-surface shadow-xl md:hidden rounded-t-xl border-t border-outline-variant/20">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center px-4 py-1 active:scale-95 duration-150 border-b-2 transition-all ${
            pathname === "/" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/" ? "'FILL' 1" : "'FILL' 0" }}>
            explore
          </span>
          <span className="font-label text-label-sm">Khám phá</span>
        </Link>
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center px-4 py-1 active:scale-95 duration-150 border-b-2 transition-all ${
            pathname?.startsWith("/search") ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname?.startsWith("/search") ? "'FILL' 1" : "'FILL' 0" }}>
            search
          </span>
          <span className="font-label text-label-sm">Tìm kiếm</span>
        </Link>
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center px-4 py-1 active:scale-95 duration-150 border-b-2 transition-all ${
            pathname === "/dashboard" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/dashboard" ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
          <span className="font-label text-label-sm">Đã lưu</span>
        </Link>
        <Link
          href="/inbox"
          className={`flex flex-col items-center justify-center px-4 py-1 active:scale-95 duration-150 border-b-2 transition-all ${
            pathname === "/inbox" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/inbox" ? "'FILL' 1" : "'FILL' 0" }}>
            chat_bubble
          </span>
          <span className="font-label text-label-sm">Tin nhắn</span>
        </Link>
      </nav>
      )}
    </>
  );
}
