"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Tổng quan", path: "/dashboard", icon: "dashboard" },
    { name: "Sản phẩm của tôi", path: "/dashboard/products", icon: "inventory_2" },
    { name: "Đơn hàng", path: "/dashboard/orders", icon: "receipt_long" },
    { name: "Thống kê", path: "/dashboard/analytics", icon: "bar_chart" },
    { name: "Cài đặt Shop", path: "/dashboard/settings", icon: "settings" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-surface-container-lowest">
      {/* Sidebar Desktop */}
      <aside className="w-64 shrink-0 bg-surface border-r border-outline-variant hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant relative">
              <Image src="https://picsum.photos/seed/snuser/80/80" alt="Shop" fill className="object-cover" />
            </div>
            <div>
              <div className="font-label-md font-bold text-on-surface">Cửa hàng Minh</div>
              <div className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded w-fit mt-0.5">Người bán cá nhân</div>
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

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
