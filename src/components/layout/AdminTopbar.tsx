"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { staffRoleLabel } from "@/lib/staff";
import { currentPageName } from "./AdminNav";

/**
 * The bar across the top of every staff page.
 *
 * It exists because this surface no longer inherits the storefront's navbar — a moderator
 * working a refund dispute does not need a cart icon or a category rail. What it carries
 * instead is the three things that were only reachable through the sidebar: which page you
 * are on, which role you hold, and the way back out.
 *
 * Below `lg` it is also the only way to open the navigation at all.
 */
export default function AdminTopbar({
  role,
  onOpenNav,
}: {
  role: string | undefined;
  onOpenNav: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 h-14 shrink-0 bg-surface/90 backdrop-blur-md border-b border-outline-variant flex items-center gap-3 px-3 sm:px-5">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Mở điều hướng"
        className="lg:hidden w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      {/* The sidebar carries the wordmark from `lg` up, so repeating it here would be the
          same word twice on one screen. Below that the sidebar is gone and this is it. */}
      <span className="lg:hidden font-headline-sm font-bold text-on-surface">Vận hành</span>
      <span className="lg:hidden text-outline-variant" aria-hidden="true">
        /
      </span>

      <h1 className="font-label-md text-on-surface truncate min-w-0">{currentPageName(pathname)}</h1>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline text-[10px] bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded uppercase tracking-wider font-bold">
          {staffRoleLabel(role)}
        </span>
        <Link
          href="/account"
          className="flex items-center gap-1.5 h-10 px-3 rounded-full font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Về tài khoản</span>
        </Link>
      </div>
    </header>
  );
}
