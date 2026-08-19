"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";

/**
 * The storefront's navbar, header and footer — everywhere except the staff console.
 *
 * `/admin` used to inherit all three, so a moderator resolving a refund dispute worked
 * under a cart icon, a category rail and a marketing footer, none of which do anything for
 * them, and each of which cost vertical room on a surface that is mostly tall queues.
 * `AdminShell` supplies its own topbar in their place.
 *
 * Deciding here rather than by moving twenty route folders into a `(storefront)` group:
 * this is one file and three lines of the root layout, and all three components were
 * already client components, so nothing crosses a boundary that did not already.
 */
export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Exactly `/admin` and everything under it. `/administrative-areas` is an API path, not
  // a route, but the guard is written this way so a future `/adminfoo` page cannot inherit
  // the staff treatment by accident.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense
        fallback={
          <div className="h-[68px] sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm" />
        }
      >
        <Navbar />
      </Suspense>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
