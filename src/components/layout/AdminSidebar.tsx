"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/hooks/api/useAccount";
import Skeleton from "@/components/ui/Skeleton";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

/**
 * The staff shell.
 *
 * Grouped the same way the account sidebar is, and for the same reason — this surface has
 * more entries than that one, and a flat list of them is a list you read rather than scan.
 */
const GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Hàng đợi",
    items: [
      { name: "Yêu cầu hỗ trợ", path: "/admin/tickets", icon: "support_agent" },
      { name: "Xác minh danh tính", path: "/admin/identity-documents", icon: "badge" },
      { name: "Tin đăng chờ duyệt", path: "/admin/listings", icon: "inventory_2" },
      { name: "Yêu cầu rút tiền", path: "/admin/withdrawals", icon: "payments" },
    ],
  },
  {
    label: "Người dùng",
    items: [
      { name: "Tài khoản", path: "/admin/accounts", icon: "group" },
      { name: "Kiểm duyệt viên", path: "/admin/moderators", icon: "shield_person" },
    ],
  },
  {
    label: "Cấu hình",
    items: [
      { name: "Danh mục", path: "/admin/categories", icon: "category" },
      { name: "Thẻ", path: "/admin/tags", icon: "sell" },
      { name: "Cổng thanh toán & vận chuyển", path: "/admin/options", icon: "tune" },
    ],
  },
  {
    label: "Đối soát",
    items: [
      { name: "Phiên thanh toán", path: "/admin/payment-sessions", icon: "receipt_long" },
    ],
  },
];

/** Who may see this surface at all. Mirrors the server's `requireModerator`. */
export function isStaff(role: string | undefined): boolean {
  return role === "moderator" || role === "admin";
}

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me, isLoading } = useMe();

  const allowed = isStaff(me?.role);

  // The gate that matters is the server's — every /admin route checks the caller's role
  // row itself. This only keeps a non-staff visitor from staring at a shell of empty
  // tables and 403 toasts.
  useEffect(() => {
    if (!isLoading && !allowed) router.replace("/account");
  }, [isLoading, allowed, router]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (!allowed) return null;

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-surface-container-lowest">
      <aside className="w-64 shrink-0 bg-surface border-r border-outline-variant hidden lg:flex flex-col">
        <div className="px-6 py-5 border-b border-outline-variant">
          <div className="font-headline-sm font-bold text-on-surface">Vận hành</div>
          {/* An admin passes every moderator check, so the two are worth telling apart. */}
          <div className="text-[10px] bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded w-fit mt-1 uppercase tracking-wider font-bold">
            {me?.role === "admin" ? "Quản trị viên" : "Kiểm duyệt viên"}
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1 mt-2 overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <h2 className="px-4 pt-4 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                {group.label}
              </h2>
              {group.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={[
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors font-label-md",
                      isActive
                        ? "bg-primary-container text-on-primary-container font-bold"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                    ].join(" ")}
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <Link
            href="/account"
            className="flex items-center justify-center gap-2 bg-surface-container-high text-on-surface font-label-md w-full py-3 rounded-xl hover:bg-surface-variant transition-colors border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Về tài khoản
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
