"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LISTING_STATUS_VI } from "@/lib/dictionaries";
import { useAuthStore } from "@/stores/use-auth-store";
import { useListingsFeed } from "@/hooks/api/useCatalog";
import { useOrdersFeed } from "@/hooks/api/useOrders";
import { useReputation } from "@/hooks/api/useShop";
import { useWallets } from "@/hooks/api/useFinance";
import { useChatUnreadCount } from "@/hooks/api/useChat";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function DashboardPage(){
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const { listings: myProducts } = useListingsFeed({ mine: true, limit: 3 });
  const { data: wallets } = useWallets();
  const { data: reputation } = useReputation(user?.id, "seller");
  // `open` means the seller already confirmed and the parcel is with a carrier — the
  // opposite of needing them. `awaiting-confirmation` is the state with a 48-hour clock
  // on it, and it was the one this widget never showed.
  const { orders: openOrders } = useOrdersFeed("seller", "awaiting-confirmation", 5);
  const { data: chatUnread } = useChatUnreadCount();

  // The seller's own currency, whichever wallet they actually hold. Available and held
  // are shown apart because escrow is not money they can spend yet.
  const wallet = wallets?.[0];

  const stats = [
    {
      label: "Số dư khả dụng",
      value: wallet ? formatPrice(wallet.available_balance) : "—",
      hint: wallet && wallet.held_balance > 0
        ? `${formatPrice(wallet.held_balance)} đang tạm giữ`
        : "Chưa có giao dịch",
      icon: "payments",
    },
    {
      label: "Đơn đã hoàn thành",
      value: reputation ? String(reputation.completed_orders) : "—",
      hint: reputation && reputation.cancelled_orders > 0
        ? `${reputation.cancelled_orders} đơn đã hủy`
        : "Chưa có đơn hủy",
      icon: "shopping_bag",
    },
    {
      label: "Đánh giá người bán",
      value:
        reputation && reputation.rating_count > 0
          ? reputation.rating_average.toFixed(1)
          : "—",
      hint: reputation
        ? `${reputation.rating_count} lượt đánh giá`
        : "Chưa có đánh giá",
      icon: "star",
    },
  ];

  const nextOrder = openOrders[0];

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
        {/* Three numbers the API can actually answer. The previous set — revenue,
            order count and page views with week-on-week deltas — had no endpoint
            behind any of them; there is no analytics surface in this API. */}
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-label-sm text-on-surface-variant mb-2">{stat.label}</div>
              <div className="font-headline-md font-bold text-on-surface mb-2">{stat.value}</div>
              <div className="font-label-sm text-on-surface-variant">{stat.hint}</div>
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
                  {myProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant font-body-sm">
                        Bạn chưa đăng sản phẩm nào.
                      </td>
                    </tr>
                  )}
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
              <Link href="/dashboard/products" className="text-primary font-label-md hover:underline">
                Quản lý toàn bộ sản phẩm
              </Link>
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
              {nextOrder ? (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="font-label-md text-on-surface truncate">
                        Đơn hàng {nextOrder.id}
                      </div>
                      <div className="font-body-sm text-on-surface-variant mt-1">
                        {openOrders.length > 1
                          ? `${openOrders.length} đơn đang chờ bạn xác nhận`
                          : "Đang chờ bạn xác nhận"}
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant shrink-0">
                      {new Date(nextOrder.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <Link href={`/orders/${nextOrder.id}`}>
                    <Button size="sm" variant="primary" fullWidth>Xem đơn hàng</Button>
                  </Link>
                </div>
              ) : (
                <div className="font-body-sm text-on-surface-variant">
                  Không có đơn hàng nào đang chờ xử lý.
                </div>
              )}

              <div className="w-full h-px bg-outline-variant border-dashed"></div>

              <div className="flex flex-col gap-3">
                <div className="font-label-md text-on-surface">
                  {chatUnread && chatUnread.unread > 0
                    ? `${chatUnread.unread} tin nhắn chưa đọc`
                    : "Không có tin nhắn mới"}
                </div>
                <Link href="/inbox">
                  <Button size="sm" variant="outline" fullWidth>Mở hộp thư</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
