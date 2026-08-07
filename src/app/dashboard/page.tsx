"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LISTING_STATUS_VI } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/money";
import { useAuthStore } from "@/stores/use-auth-store";
import ListingRowActions from "./products/_components/ListingRowActions";
import OverviewStats from "./_components/OverviewStats";
import { useDashboardOverview } from "./_hooks/useDashboardOverview";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const {
    listings,
    wallet,
    walletLoading,
    reputation,
    pendingOrders,
    chatUnread,
    summary,
    summaryLoading,
    revenue,
  } = useDashboardOverview(user?.id);

  const nextOrder = pendingOrders[0];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-headline font-bold text-headline-md text-on-surface mb-2">
            Chào mừng trở lại, {user?.username || "Bạn"}!
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Đây là tổng quan hoạt động kinh doanh của bạn.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={handleLogout}
          className="flex items-center gap-2 border-error text-error hover:bg-error/10"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Đăng xuất
        </Button>
      </div>

      <OverviewStats
        balance={wallet}
        balanceLoading={walletLoading}
        summary={summary}
        summaryLoading={summaryLoading}
        revenue={revenue}
        reputation={reputation}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-headline-sm font-bold text-on-surface">Sản phẩm của tôi</h2>
              <Link
                href="/dashboard/products"
                className="text-primary font-label-md hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low font-label-sm text-on-surface-variant border-b border-outline-variant">
                    <th className="p-4 pl-6 w-[350px]">Sản phẩm</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Giá</th>
                    <th className="p-4 pr-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {listings.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-on-surface-variant font-body-sm"
                      >
                        Bạn chưa đăng sản phẩm nào.
                      </td>
                    </tr>
                  )}
                  {listings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="hover:bg-surface-container-lowest transition-colors"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded border border-outline-variant relative overflow-hidden shrink-0 bg-surface-container flex items-center justify-center text-xs">
                            {listing.cover ? (
                              <Image
                                src={listing.cover.url || ""}
                                alt={listing.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              "Img"
                            )}
                          </div>
                          <Link
                            href={`/dashboard/products/${listing.id}`}
                            className="font-label-md text-on-surface hover:text-primary transition-colors truncate max-w-[220px]"
                          >
                            {listing.name}
                          </Link>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="surface"
                          className={
                            listing.status === "active"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : ""
                          }
                        >
                          {LISTING_STATUS_VI[listing.status]}
                        </Badge>
                      </td>
                      <td className="p-4 font-body-sm text-on-surface-variant">
                        {formatMoney(listing.price, listing.currency)}
                      </td>
                      <td className="p-4 pr-6">
                        <ListingRowActions listing={listing} compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-outline-variant flex justify-center bg-surface-container-lowest">
              <Link
                href="/dashboard/products"
                className="text-primary font-label-md hover:underline"
              >
                Quản lý toàn bộ sản phẩm
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
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
                        {pendingOrders.length > 1
                          ? `${pendingOrders.length} đơn đang chờ bạn xác nhận`
                          : "Đang chờ bạn xác nhận"}
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant shrink-0">
                      {new Date(nextOrder.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <Link href={`/orders/${nextOrder.id}`}>
                    <Button size="sm" variant="primary" fullWidth>
                      Xem đơn hàng
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="font-body-sm text-on-surface-variant">
                  Không có đơn hàng nào đang chờ xử lý.
                </div>
              )}

              <div className="w-full h-px bg-outline-variant border-dashed" />

              <div className="flex flex-col gap-3">
                <div className="font-label-md text-on-surface">
                  {chatUnread > 0 ? `${chatUnread} tin nhắn chưa đọc` : "Không có tin nhắn mới"}
                </div>
                <Link href="/inbox">
                  <Button size="sm" variant="outline" fullWidth>
                    Mở hộp thư
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Money the seller cannot spend yet is worth a card of its own: it is the
              single most common "where is my money" question, and the answer is that the
              escrow has not closed rather than that anything went wrong. */}
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6">
            <h2 className="font-headline-sm font-bold text-on-surface mb-2">Ví của tôi</h2>
            <p className="font-body-sm text-on-surface-variant mb-4">
              {wallet.held_balance > 0
                ? `${formatMoney(wallet.held_balance, wallet.currency)} đang được giữ hộ cho các đơn chưa kết thúc.`
                : "Toàn bộ số dư của bạn đã sẵn sàng để rút."}
            </p>
            <Link href="/dashboard/wallet">
              <Button size="sm" variant="outline" fullWidth>
                Xem số dư và rút tiền
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
