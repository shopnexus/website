"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/api/useAccount";

interface NavItem {
  name: string;
  path: string;
  icon: string;
  /**
   * Hidden from a moderator, because the read behind it is `requireAdmin` and the page could
   * only ever be a failed request. Not every admin-only *write* earns this — categories, tags
   * and options are public reads with admin-only writes, so a moderator reads them and
   * `AdminOnlyNotice` explains the missing buttons. These three are the ones where the list
   * itself is refused, and one of them was reported putting `{"error":{"code":
   * "admin_required"}}` on screen.
   */
  adminOnly?: boolean;
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
      { name: "Xác minh KYC", path: "/admin/identity-documents", icon: "badge" },
      { name: "Tin chờ duyệt", path: "/admin/listings", icon: "inventory_2" },
      { name: "Rút tiền", path: "/admin/withdrawals", icon: "payments", adminOnly: true },
    ],
  },
  {
    label: "Người dùng",
    items: [
      { name: "Tài khoản", path: "/admin/accounts", icon: "group" },
      { name: "Kiểm duyệt viên", path: "/admin/moderators", icon: "shield_person", adminOnly: true },
    ],
  },
  {
    label: "Cấu hình",
    items: [
      { name: "Danh mục", path: "/admin/categories", icon: "category" },
      { name: "Thẻ", path: "/admin/tags", icon: "sell" },
      { name: "Thanh toán & vận chuyển", path: "/admin/options", icon: "tune" },
    ],
  },
  {
    label: "Đối soát",
    items: [
      {
        name: "Phiên thanh toán",
        path: "/admin/payment-sessions",
        icon: "receipt_long",
        adminOnly: true,
      },
    ],
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
  return currentPageTrail(pathname).name;
}

/**
 * Where you are, as the two names the topbar shows: the group and the page.
 *
 * The group is the same word `PageHeader` used to print as an eyebrow above the page title,
 * one screen below the sidebar heading that already said it. Reading it off the nav means it
 * cannot disagree with the sidebar, and it only exists in one place.
 */
export function currentPageTrail(pathname: string): { group: string | null; name: string } {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isNavItemActive(item.path, pathname)) {
        // The overview is not "in" a group as far as a reader is concerned — it is the root.
        return { group: item.path === "/admin" ? null : group.label, name: item.name };
      }
    }
  }
  return { group: null, name: "Vận hành" };
}

/**
 * The link list itself, rendered twice: in the fixed sidebar from `lg` up, and inside the
 * drawer below it. `onNavigate` is how the drawer closes on a tap that keeps you on the
 * same route — a route change closes it on its own, but re-tapping the current page does
 * not fire one.
 */
export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: me } = useMe();
  const isAdmin = me?.role === "admin";

  // Filtered before the groups are drawn, so a group whose every item is admin-only
  // disappears with its heading rather than leaving "ĐỐI SOÁT" over nothing. While the role
  // is still unknown the admin-only rows are held back: showing them and then removing them
  // is a nav that moves under the pointer.
  const groups = NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.filter((item) => !item.adminOnly || isAdmin),
  })).filter((group) => group.items.length > 0);

  return (
    <nav className="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <h2 className="px-3 pt-4 pb-1 text-label-xs uppercase tracking-[0.08em] text-on-surface-variant">
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
                  "relative flex items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 font-label-md transition-colors",
                  isActive
                    ? "bg-surface-container-high font-bold text-on-surface before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-primary"
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
