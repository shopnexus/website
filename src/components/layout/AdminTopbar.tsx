"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { staffRoleLabel } from "@/lib/staff";
import { currentPageTrail } from "./AdminNav";

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
  const trail = currentPageTrail(pathname);

  return (
    <header className="sticky top-0 z-30 h-12 shrink-0 bg-surface/90 backdrop-blur-md border-b border-outline-variant flex items-center gap-3 px-3 sm:px-5">
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
      <span className="lg:hidden font-title-md font-bold text-on-surface">Vận hành</span>

      {/*
       * A breadcrumb, and deliberately not an `<h1>`. There were two on every page — this
       * one and the page's own — and between them the same words appeared three times on one
       * screen: the sidebar's active row, this bar, and the title in the body. The page owns
       * the heading; this is wayfinding, so it is a `nav`.
       */}
      <nav aria-label="Vị trí" className="flex min-w-0 items-center gap-1.5 font-label-md">
        {trail.group && (
          <>
            <span className="hidden shrink-0 text-on-surface-variant sm:inline">
              {trail.group}
            </span>
            <span className="hidden shrink-0 text-outline sm:inline" aria-hidden="true">
              /
            </span>
          </>
        )}
        <span className="min-w-0 truncate text-on-surface">{trail.name}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {/* Neutral. It was `tertiary-container` — #924628 — so the loudest thing on the bar
            was a label that never changes while you work. */}
        <span className="hidden sm:inline rounded bg-surface-container-high px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
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
