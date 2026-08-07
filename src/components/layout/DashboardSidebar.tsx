"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { isStaff } from "@/components/layout/AdminSidebar";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Fourteen flat rows is a list you read rather than scan, and it had grown by accretion —
  // "Cài đặt bán hàng" sat next to "Cài đặt thông báo" although one is a shop and the other
  // is an inbox. Grouped by the job at hand instead, with headings rather than collapsible
  // sections: a group you have to open is a group you have to remember the name of.
  const groups: Array<{ label: string | null; items: NavItem[] }> = [
    { label: null, items: [{ name: "Tổng quan", path: "/dashboard", icon: "dashboard" }] },
    {
      label: "Giao dịch",
      items: [
        { name: "Đơn hàng", path: "/orders", icon: "receipt_long" },
        { name: "Hoàn tiền", path: "/refunds", icon: "assignment_return" },
        { name: "Ví của tôi", path: "/dashboard/wallet", icon: "account_balance_wallet" },
      ],
    },
    {
      label: "Bán hàng",
      items: [
        { name: "Sản phẩm của tôi", path: "/dashboard/products", icon: "inventory_2" },
        { name: "Thống kê", path: "/dashboard/analytics", icon: "bar_chart" },
        { name: "Cài đặt bán hàng", path: "/dashboard/settings", icon: "storefront" },
      ],
    },
    {
      label: "Bộ sưu tập",
      items: [
        { name: "Đã lưu", path: "/dashboard/favorites", icon: "favorite" },
        // The page existed with nothing linking to it.
        { name: "Đang theo dõi", path: "/dashboard/following", icon: "group" },
      ],
    },
    {
      label: "Tài khoản",
      items: [
        { name: "Hồ sơ cá nhân", path: "/dashboard/profile", icon: "person" },
        { name: "Sổ địa chỉ", path: "/dashboard/contacts", icon: "contacts" },
        { name: "Bảo mật", path: "/dashboard/security", icon: "shield" },
        { name: "Xác minh danh tính", path: "/dashboard/verification", icon: "verified_user" },
        { name: "Thông báo", path: "/dashboard/notifications", icon: "notifications" },
      ],
    },
    { label: null, items: [{ name: "Trung tâm hỗ trợ", path: "/support", icon: "support_agent" }] },
  ];

  // The staff surface had eleven working pages and nothing anywhere linking to them, so the
  // only way in was typing the URL. Shown only to staff: to everyone else it would be a row
  // that leads to a redirect.
  if (isStaff(user?.role)) {
    groups.splice(1, 0, {
      label: "Vận hành",
      items: [{ name: "Bảng điều hành", path: "/admin", icon: "admin_panel_settings" }],
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-surface-container-lowest">
      <aside className="w-64 shrink-0 bg-surface border-r border-outline-variant hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant relative bg-surface-container-high flex items-center justify-center">
              {user?.profile?.avatar?.url ? (
                <Image src={user.profile.avatar.url} alt="Shop" fill className="object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              )}
            </div>
            <div>
              <div className="font-label-md font-bold text-on-surface line-clamp-1">{user?.username || "Người dùng"}</div>
              <div className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded w-fit mt-0.5">
                {user?.identity_verified ? "Đã xác minh" : "Người dùng mới"}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1 mt-4 overflow-y-auto">
          {groups.map((group, index) => (
            <div key={group.label ?? `plain-${index}`} className="flex flex-col gap-1">
              {group.label && (
                <h2 className="px-4 pt-4 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  {group.label}
                </h2>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.path;
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
          <Link href="/sell" className="flex items-center justify-center gap-2 bg-surface-container-high text-on-surface font-label-md w-full py-3 rounded-xl hover:bg-surface-variant transition-colors border border-outline-variant">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Đăng tin mới
          </Link>
        </div>
      </aside>

      {/* A <div>: the root layout already opens the page's one <main>, and this sits
          inside it — two landmarks make a screen reader announce two "main" regions. */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
