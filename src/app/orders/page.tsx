"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ORDER_STATE_VI } from "@/lib/dictionaries";
import { useOrderListings, useOrdersFeed } from "@/hooks/api/useOrders";
import type { OrderState } from "@/api/generated/types.gen";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

type Tab = "all" | OrderState;

const STATUS_BADGES: Record<OrderState, { label: string; className: string }> = {
  open: { label: "Đang xử lý", className: "bg-primary/10 text-primary border border-primary/20" },
  completed: { label: "Giao thành công", className: "bg-secondary-container text-on-secondary-container" },
  cancelled: { label: "Đã hủy", className: "bg-error-container text-on-error-container" },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  // Filtered by the API, not in memory: `state` is a query parameter, and a cursor
  // stream cannot be counted or filtered client-side without loading all of it. Which is
  // also why the tabs carry no counts — /orders reports no total by design.
  const { orders, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useOrdersFeed(
    "buyer",
    activeTab === "all" ? undefined : activeTab,
  );

  const listingsById = useOrderListings(orders);

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "open", label: ORDER_STATE_VI.open },
    { id: "completed", label: ORDER_STATE_VI.completed },
    { id: "cancelled", label: ORDER_STATE_VI.cancelled },
  ];

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        <h1 className="font-headline-md font-bold mb-6">Đơn mua của tôi</h1>

        <div className="bg-surface rounded-t-2xl border border-outline-variant border-b-0 overflow-hidden shadow-sm">
          <Tabs tabs={tabs} activeTabId={activeTab} onChange={(id) => setActiveTab(id as Tab)} fullWidth />
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="bg-surface rounded-b-2xl border border-outline-variant p-12 text-center text-on-surface-variant shadow-sm">
              Đang tải đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-surface rounded-b-2xl border border-outline-variant p-12 text-center text-on-surface-variant shadow-sm">
              Không có đơn hàng nào.
            </div>
          ) : (
            orders.map((order, idx) => {
              const badge = STATUS_BADGES[order.state];

              return (
                <div key={order.id} className={["bg-surface border border-outline-variant p-6 shadow-sm", idx === 0 ? "rounded-b-2xl" : "rounded-2xl"].join(" ")}>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant border-dashed">
                    <div className="flex items-center gap-3">
                      <span className="font-label-md text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[20px]">store</span>
                        {order.seller.name}
                      </span>
                      <Link href={`/shop/${order.seller.id}`} className="hidden sm:flex text-primary font-body-sm hover:underline items-center">
                        Xem Shop
                      </Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant hidden sm:inline-block">Mã ĐH: {order.id}</span>
                      <span className="text-on-surface-variant hidden sm:inline-block">|</span>
                      <Badge variant="surface" className={badge.className}>{badge.label}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mb-4">
                    {order.items?.map((item) => {
                      // Resolved separately; may still be loading, or gone if the seller
                      // deleted the listing after the sale.
                      const listing = listingsById.get(item.listing_id);
                      return (
                        <div key={item.id} className="flex gap-4">
                          <div className="relative w-20 h-20 bg-surface-container rounded border border-outline-variant overflow-hidden shrink-0">
                            {listing?.cover?.url ? (
                              <Image src={listing.cover.url} alt={listing.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">N/A</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${item.listing_id}`} className="font-body-md text-on-surface hover:text-primary transition-colors line-clamp-2">
                              {listing?.name ?? "Sản phẩm"}
                            </Link>
                            <div className="text-body-sm text-on-surface-variant mt-1">x{item.quantity}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-price-md text-on-surface">
                              {formatPrice(item.total_amount / item.quantity)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="font-body-sm text-on-surface-variant text-center sm:text-left w-full sm:w-auto">
                      Đặt ngày: <span className="text-on-surface">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-on-surface">Thành tiền:</span>
                        {/* Summed from the live lines by the server, not recomputed here. */}
                        <span className="font-price-lg text-primary text-xl font-bold">{formatPrice(order.total)}</span>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        {order.state === "open" && (
                          <>
                            <Link href={`/orders/${order.id}`} className="flex-1 sm:flex-none">
                              <Button variant="primary" className="w-full">Theo dõi đơn hàng</Button>
                            </Link>
                            <Button variant="outline" className="flex-1 sm:flex-none hidden sm:flex">Liên hệ</Button>
                          </>
                        )}

                        {order.state === "completed" && (
                          <>
                            <Button variant="primary" className="flex-1 sm:flex-none">Đánh giá</Button>
                            <Button variant="outline" className="flex-1 sm:flex-none">Mua lại</Button>
                            <Link href={`/orders/${order.id}`} className="hidden sm:block">
                              <Button variant="ghost">Chi tiết</Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                {isFetchingNextPage ? "Đang tải..." : "Tải thêm đơn hàng"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
