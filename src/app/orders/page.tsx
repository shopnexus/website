"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { mockOrderPage } from "@/lib/mocks/order.mock";
import { ORDER_STATE_VI } from "@/lib/dictionaries";
import type { OrderState } from "@/types/order.type";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function OrdersPage(){
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "open", label: "Đang xử lý", count: mockOrderPage.data.filter(o => o.state === 'open').length },
    { id: "completed", label: "Hoàn thành", count: mockOrderPage.data.filter(o => o.state === 'completed').length },
    { id: "cancelled", label: "Đã hủy" },
  ];

  const filteredOrders = activeTab === "all" ? mockOrderPage.data : mockOrderPage.data.filter((o) => o.state === activeTab);

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "open":
        return <Badge variant="surface" className="bg-primary/10 text-primary border border-primary/20">Đang xử lý</Badge>;
      case "completed":
        return <Badge variant="surface" className="bg-secondary-container text-on-secondary-container">Giao thành công</Badge>;
      case "cancelled":
        return <Badge variant="surface" className="bg-error-container text-on-error-container">Đã hủy</Badge>;
      default:
        return <Badge variant="surface">{ORDER_STATE_VI[state as OrderState] || state}</Badge>;
    }
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        <h1 className="font-headline-md font-bold mb-6">Đơn mua của tôi</h1>

        {/* Tabs */}
        <div className="bg-surface rounded-t-2xl border border-outline-variant border-b-0 overflow-hidden shadow-sm">
          <Tabs tabs={tabs} activeTabId={activeTab} onChange={setActiveTab} fullWidth />
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-surface rounded-b-2xl border border-outline-variant p-12 text-center text-on-surface-variant shadow-sm">
              Không có đơn hàng nào.
            </div>
          ) : (
            filteredOrders.map((order, idx) => {
              // Calculate total from items for display if order total_amount isn't present
              const totalAmount = order.items?.reduce((sum, item) => sum + item.total_amount, 0) || 0;
              
              return (
                <div key={order.id} className={["bg-surface border border-outline-variant p-6 shadow-sm", idx === 0 ? "rounded-b-2xl" : "rounded-2xl"].join(" ")}>
                  {/* Order Header */}
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant border-dashed">
                    <div className="flex items-center gap-3">
                      <span className="font-label-md text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[20px]">store</span>
                        Shop {order.seller_id}
                      </span>
                      <Link href={`/shop/${order.seller_id}`} className="hidden sm:flex text-primary font-body-sm hover:underline items-center">
                        Xem Shop
                      </Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant hidden sm:inline-block">Mã ĐH: {order.id}</span>
                      <span className="text-on-surface-variant hidden sm:inline-block">|</span>
                      {getStatusBadge(order.state)}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="flex flex-col gap-4 mb-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-20 h-20 bg-surface-container rounded border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center text-xs">
                          SKU img
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.sku_id}`} className="font-body-md text-on-surface hover:text-primary transition-colors line-clamp-2">
                            Sản phẩm {item.sku_id}
                          </Link>
                          <div className="text-body-sm text-on-surface-variant mt-1">x{item.quantity}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-price-md text-on-surface">{formatPrice(item.total_amount / item.quantity)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="font-body-sm text-on-surface-variant text-center sm:text-left w-full sm:w-auto">
                      Đặt ngày: <span className="text-on-surface">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-on-surface">Thành tiền:</span>
                        <span className="font-price-lg text-primary text-xl font-bold">{formatPrice(totalAmount)}</span>
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
        </div>
      </div>
    </div>
  );
}
