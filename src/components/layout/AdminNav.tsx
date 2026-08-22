"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

/**
 * The staff navigation, as data.
 *
 * Grouped the same way the account sidebar is, and for the same reason — this surface has
 * more entries than that one, and a flat list of them is a list you read rather than scan.
 *
 * Exported because the topbar names the current page off it: one list, so a page added
 * here cannot end up with a nav row and no title.
 */
export const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Tổng quan",
    items: [{ name: "Bảng điều hành", path: "/admin", icon: "space_dashboard" }],
  },
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
    items: [{ name: "Phiên thanh toán", path: "/admin/payment-sessions", icon: "receipt_long" }],
  },
];

/**
 * Whether a nav row owns the current URL.
 *
 * `/admin` is matched exactly: every other path is a prefix of it, so a `startsWith` test
 * would light the overview row up on all eleven pages.
 */
export function isNavItemActive(itemPath: string, pathname: string): boolean {
  if (itemPath === "/admin") return pathname === "/admin";
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
}

/** The name of the page being looked at, for the topbar. */
export function currentPageName(pathname: string): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isNavItemActive(item.path, pathname)) return item.name;
    }
  }
  return "Vận hành";
}

/**
 * The link list itself, rendered twice: in the fixed sidebar from `lg` up, and inside the
 * drawer below it. `onNavigate` is how the drawer closes on a tap that keeps you on the
 * same route — a route change closes it on its own, but re-tapping the current page does
 * not fire one.
 */
export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 pb-4 flex flex-col gap-1 overflow-y-auto">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <h2 className="px-4 pt-4 pb-1 text-label-xs uppercase tracking-[0.08em] text-on-surface-variant">
            {group.label}
          </h2>
          {group.items.map((item) => {
            const isActive = isNavItemActive(item.path, pathname);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors font-label-md",
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                ].join(" ")}
              >
                <span
                  className="material-symbols-outlined text-[20px] shrink-0"
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
  );
}
