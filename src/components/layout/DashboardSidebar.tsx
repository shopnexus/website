"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { isStaff } from "@/lib/staff";

interface NavItem {
  name: string;
  path: string;
  icon: string;
  /** Extra routes this entry owns, for one item that fronts a tabbed group of pages. */
  match?: string[];
}

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Fourteen flat rows is a list you read rather than scan, and it had grown by accretion —
  // "Cài đặt bán hàng" sat next to "Cài đặt thông báo" although one is a shop and the other
  // is an inbox. Grouped by the job at hand instead, with headings rather than collapsible
  // sections: a group you have to open is a group you have to remember the name of.
  const isSeller = Boolean(user?.identity_verified);

  const groups: Array<{ label: string | null; items: NavItem[] }> = [
    {
      label: "Tài khoản",
      items: [
        // Profile, security and notifications are one destination with three tabs: five
        // near-identical settings entries made the rail hard to scan.
        {
          name: "Tài khoản",
          path: "/account/profile",
          icon: "manage_accounts",
          match: ["/account/security", "/account/notifications"],
        },
        { name: "Thông tin liên lạc", path: "/account/contacts", icon: "contacts" },
        { name: "Xác minh danh tính", path: "/account/verification", icon: "verified_user" },
      ],
    },
    {
      label: "Mua hàng",
      items: [
        { name: "Đơn mua", path: "/account/orders", icon: "receipt_long" },
        { name: "Ví của tôi", path: "/account/wallet", icon: "account_balance_wallet" },
      ],
    },
  ];

  if (isSeller) {
    groups.push({
      label: "Bán hàng",
      items: [
        { name: "Sản phẩm của tôi", path: "/account/products", icon: "inventory_2" },
        { name: "Đơn bán", path: "/account/sales", icon: "receipt_long" },
        { name: "Thống kê", path: "/account/analytics", icon: "bar_chart" },
        { name: "Cài đặt bán hàng", path: "/account/settings", icon: "storefront" },
      ],
    });
  }

  groups.push(
    {
      label: "Bộ sưu tập",
      items: [
        { name: "Đã lưu", path: "/account/favorites", icon: "favorite" },
        // The page existed with nothing linking to it.
        { name: "Đang theo dõi", path: "/account/following", icon: "group" },
      ],
    },
    { label: null, items: [{ name: "Hỗ trợ", path: "/inbox?tab=support", icon: "support_agent" }] }
  );

  // The staff surface had eleven working pages and nothing anywhere linking to them, so the
  // only way in was typing the URL. Shown only to staff: to everyone else it would be a row
  // that leads to a redirect.
  if (isStaff(user?.role)) {
    groups.unshift({
      label: "Vận hành",
      items: [{ name: "Bảng điều hành", path: "/admin", icon: "admin_panel_settings" }],
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-surface-container-lowest">
      <aside className="w-64 shrink-0 bg-surface border-r border-outline-variant hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/account" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant relative bg-surface-container-high flex items-center justify-center">
              {user?.profile?.avatar?.url ? (
                <Image src={user.profile.avatar.url} alt="Shop" fill className="object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              )}
            </div>
            <div>
              <div className="font-label-md font-bold text-on-surface line-clamp-1">{user?.username || "Người dùng"}</div>
              <div className="text-label-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded w-fit mt-0.5">
                {user?.identity_verified ? "Đã xác minh" : "Người dùng mới"}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          {groups.map((group, index) => (
            <div key={group.label ?? `plain-${index}`} className="flex flex-col gap-1">
              {group.label && (
                <h2 className={`px-4 pb-1 text-label-xs uppercase tracking-[0.08em] text-on-surface-variant ${index === 0 ?"pt-0" :"pt-4"}`}>
                  {group.label}
                </h2>
              )}
              {group.items.map((item) => {
                // A path may carry the tab it opens; the router never puts a query in `pathname`.
                const base = item.path.split("?")[0];
                const isActive = pathname === base || (item.match?.includes(pathname ?? "") ?? false);
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
        
        <div className="p-4 mt-auto flex flex-col gap-2">
          {isSeller ? (
            <Link href="/sell" className="flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md w-full py-3 rounded-xl hover:opacity-90 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Đăng tin mới
            </Link>
          ) : (
            <Link href="/account/verification" className="flex items-center justify-center gap-2 bg-surface-container-high text-on-surface font-label-md w-full py-3 rounded-xl hover:bg-surface-variant transition-colors border border-outline-variant">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Bắt đầu bán hàng
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-error font-label-md w-full py-3 rounded-xl hover:bg-error/10 transition-colors mt-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Đăng xuất
          </button>
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
