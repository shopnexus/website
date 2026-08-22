"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/hooks/api/useAccount";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { isStaff } from "@/lib/staff";
import AdminNav from "./AdminNav";
import AdminTopbar from "./AdminTopbar";

/**
 * The staff shell: navigation, the topbar, and the role gate around both.
 *
 * The sidebar is `sticky h-screen` rather than a plain column so a queue five hundred rows
 * long scrolls under a navigation that stays put — this surface is worked by jumping
 * between queues, and having to scroll back up to switch was the cost of the old layout.
 *
 * Below `lg` the same navigation becomes a drawer. It used to be `hidden lg:flex` with
 * nothing in its place, which left a tablet with eleven pages and no way to reach any of
 * them but the address bar.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me, isError, isFetching, refetch } = useMe();
  const panelRef = useRef<HTMLDivElement>(null);

  // The drawer's open state is which route it was opened over, not a boolean, so a
  // navigation closes it by making the two disagree during the render that follows. An
  // effect watching `pathname` would have to setState from inside itself — a cascading
  // render, and one that misses browser back and forward, which change the route without
  // going through a link in the panel.
  const [openedOver, setOpenedOver] = useState<string | null>(null);
  const navOpen = openedOver === pathname;
  const closeNav = () => setOpenedOver(null);

  // Three states, not two: staff, not staff, and *no answer yet*. `me` alone cannot tell
  // the last two apart, which is the whole bug this shape exists to avoid.
  const answered = me !== undefined;
  const allowed = isStaff(me?.role);

  // The gate that matters is the server's — every /admin route checks the caller's role
  // row itself. This only keeps a non-staff visitor from staring at a shell of empty
  // tables and 403 toasts.
  //
  // It fires on a *positive* answer only. Keyed on `!isLoading` it also fired whenever the
  // `/me` query merely failed to produce one — a request aborted by a fast navigation, a
  // 401 on an access token that was about to be refreshed, one blip on the wire — because
  // a query that has errored is no longer loading and still has no data. That is how an
  // admin opening /admin landed on /account/profile and got in on the third try: nothing
  // was wrong with their role, the answer just had not arrived yet.
  useEffect(() => {
    if (answered && !allowed) router.replace("/account");
  }, [answered, allowed, router]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenedOver(null);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [navOpen]);

  // Asking again is the answer here, not signing out: `me` is the only thing missing, and
  // it is one request. Bouncing to /account instead threw away a URL the user typed.
  if (!answered && isError) {
    return (
      <div className="p-8 flex flex-col items-start gap-3">
        <h1 className="font-headline-sm font-bold text-on-surface">
          Không kiểm tra được quyền truy cập
        </h1>
        <p className="text-body-sm text-on-surface-variant max-w-md">
          Không đọc được tài khoản của bạn, nên trang vận hành chưa mở. Đây thường là sự cố
          kết nối chứ không phải quyền của bạn.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Đang thử lại..." : "Thử lại"}
          </Button>
          <Link href="/account">
            <Button variant="ghost">Về tài khoản</Button>
          </Link>
        </div>
      </div>
    );
  }
  if (!answered) {
    return (
      <div className="p-8 flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (!allowed) return null;

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <aside className="w-64 shrink-0 hidden lg:flex flex-col sticky top-0 h-screen bg-surface border-r border-outline-variant">
        <Wordmark />
        <AdminNav />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar role={me?.role} onOpenNav={() => setOpenedOver(pathname)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeNav}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Điều hướng vận hành"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface border-r border-outline-variant flex flex-col outline-none"
          >
            <div className="flex items-start justify-between">
              <Wordmark />
              <button
                type="button"
                onClick={closeNav}
                aria-label="Đóng điều hướng"
                className="m-3 w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <AdminNav onNavigate={closeNav} />
          </div>
        </div>
      )}
    </div>
  );
}

/** The one thing telling you which of the two consoles you are in. */
function Wordmark() {
  return (
    <div className="px-6 py-4 min-w-0">
      <div className="font-headline-sm font-bold text-on-surface">Vận hành</div>
      <div className="font-label-sm text-on-surface-variant mt-0.5">ShopNexus</div>
    </div>
  );
}
