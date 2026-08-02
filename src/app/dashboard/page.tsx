"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { mockListingPage } from "@/lib/mocks/catalog.mock";
import { LISTING_STATUS_VI } from "@/lib/dictionaries";
import { mockPublicAccount } from "@/lib/mocks/account.mock";
import { useAuthStore } from "@/stores/use-auth-store";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function DashboardPage(){
  const myProducts = mockListingPage.data.slice(0, 3);

  const DASHBOARD_STATS = [
    { label: "Doanh thu", value: "12,450,000đ", change: 12.5, icon: "payments" },
    { label: "Đơn hàng", value: "24", change: 8.2, icon: "shopping_bag" },
    { label: "Lượt xem trang", value: "1,204", change: -2.4, icon: "visibility" },
  ];
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-headline font-bold text-headline-md text-on-surface mb-2">Chào mừng trở lại, {user?.username || "Bạn"}!</h1>
          <p className="text-body-md text-on-surface-variant">Đây là tổng quan hoạt động kinh doanh của bạn hôm nay.</p>
        </div>
        <Button variant="outline" size="md" onClick={handleLogout} className="flex items-center gap-2 border-error text-error hover:bg-error/10">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {DASHBOARD_STATS.map((stat, idx) => (
          <div key={idx} className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-label-sm text-on-surface-variant mb-2">{stat.label}</div>
              <div className="font-headline-md font-bold text-on-surface mb-2">{stat.value}</div>
              <div className={["font-label-sm flex items-center gap-1", stat.change > 0 ? "text-primary" : "text-error"].join(" ")}>
                <span className="material-symbols-outlined text-[16px]">
                  {stat.change > 0 ? "trending_up" : "trending_down"}
                </span>
                {Math.abs(stat.change)}% so với tuần trước
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-headline-sm font-bold text-on-surface">Sản phẩm của tôi</h2>
              <Link href="/dashboard/products" className="text-primary font-label-md hover:underline">Xem tất cả</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low font-label-sm text-on-surface-variant border-b border-outline-variant">
                    <th className="p-4 pl-6 w-[350px]">Sản phẩm</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Giá</th>
                    <th className="p-4 pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {myProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded border border-outline-variant relative overflow-hidden shrink-0 bg-surface-container flex items-center justify-center text-xs">
                            {prod.cover ? (
                              <Image src={prod.cover.url || ''} alt={prod.name} fill className="object-cover" />
                            ) : (
                              "Img"
                            )}
                          </div>
                          <div>
                            <div className="font-label-md text-on-surface mb-1 truncate max-w-[200px]">{prod.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="surface" className={prod.status === "active" ? "bg-primary/10 text-primary border border-primary/20" : ""}>
                          {LISTING_STATUS_VI[prod.status] || prod.status}
                        </Badge>
                      </td>
                      <td className="p-4 font-body-sm text-on-surface-variant">{formatPrice(prod.price)}</td>
                      <td className="p-4 pr-6">
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors" title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="p-1.5 rounded bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors" title="Ẩn/Hiện">
                            <span className="material-symbols-outlined text-[18px]">{prod.status === "active" ? "visibility_off" : "visibility"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-outline-variant flex justify-center bg-surface-container-lowest">
              <div className="flex gap-1">
                <button className="w-8 h-8 rounded border border-primary bg-primary text-on-primary font-bold text-sm">1</button>
                <button className="w-8 h-8 rounded border border-outline-variant text-on-surface hover:bg-surface-container-low text-sm">2</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
              <h2 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">error</span>
                Cần xử lý
              </h2>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-label-md text-on-surface">Đơn hàng mới #ORD-9824X</div>
                    <div className="font-body-sm text-on-surface-variant mt-1">Chờ xác nhận & chuẩn bị hàng</div>
                  </div>
                  <span className="text-xs text-on-surface-variant">10 phút trước</span>
                </div>
                <Button size="sm" variant="primary">Chuẩn bị hàng</Button>
              </div>
              
              <div className="w-full h-px bg-outline-variant border-dashed"></div>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-label-md text-on-surface">Tin nhắn mới từ Khách hàng</div>
                    <div className="font-body-sm text-on-surface-variant mt-1 line-clamp-1">&quot;Shop ơi, sản phẩm này còn không ạ?&quot;</div>
                  </div>
                  <span className="text-xs text-on-surface-variant">1 giờ trước</span>
                </div>
                <Link href="/inbox">
                  <Button size="sm" variant="outline" fullWidth>Trả lời tin nhắn</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
