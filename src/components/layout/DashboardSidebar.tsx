"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [
    { name: "Tổng quan", path: "/dashboard", icon: "dashboard" },
    { name: "Hồ sơ cá nhân", path: "/dashboard/profile", icon: "person" },
    { name: "Sổ địa chỉ", path: "/dashboard/contacts", icon: "contacts" },
    { name: "Bảo mật", path: "/dashboard/security", icon: "shield" },
    { name: "Xác minh danh tính", path: "/dashboard/verification", icon: "verified_user" },
    { name: "Sản phẩm của tôi", path: "/dashboard/products", icon: "inventory_2" },
    { name: "Đơn hàng", path: "/dashboard/orders", icon: "receipt_long" },
    { name: "Thống kê", path: "/dashboard/analytics", icon: "bar_chart" },
    { name: "Cài đặt Shop", path: "/dashboard/settings", icon: "settings" },
    { name: "Cài đặt thông báo", path: "/dashboard/notifications", icon: "notifications" },
    { name: "Trung tâm hỗ trợ", path: "/support", icon: "support_agent" },
  ];

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

        <nav className="flex-1 px-4 flex flex-col gap-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={[
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-label-md",
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                ].join(" ")}
              >
                <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <Link href="/sell" className="flex items-center justify-center gap-2 bg-surface-container-high text-on-surface font-label-md w-full py-3 rounded-xl hover:bg-surface-variant transition-colors border border-outline-variant">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Đăng tin mới
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
