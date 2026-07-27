"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ORDERS, formatPrice } from "@/lib/mock-data";

export default function OrdersPage(){
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending_payment", label: "Chờ thanh toán", count: 1 },
    { id: "shipping", label: "Đang giao", count: 1 },
    { id: "delivered", label: "Hoàn thành" },
    { id: "returned", label: "Trả hàng/Hoàn tiền" },
  ];

  const filteredOrders = activeTab === "all" ? ORDERS : ORDERS.filter((o) => o.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shipping":
        return <Badge variant="surface" className="bg-primary/10 text-primary border border-primary/20">Đang giao hàng</Badge>;
      case "delivered":
        return <Badge variant="surface" className="bg-secondary-container text-on-secondary-container">Giao thành công</Badge>;
      case "pending_payment":
        return <Badge variant="surface" className="bg-error-container text-on-error-container">Chờ thanh toán</Badge>;
      default:
        return <Badge variant="surface">{status}</Badge>;
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
            filteredOrders.map((order, idx) => (
              <div key={order.id} className={["bg-surface border border-outline-variant p-6 shadow-sm", idx === 0 ? "rounded-b-2xl" : "rounded-2xl"].join(" ")}>
                {/* Order Header */}
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
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Items */}
                <div className="flex flex-col gap-4 mb-4">
                  {order.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-4">
                      <div className="relative w-20 h-20 rounded border border-outline-variant overflow-hidden shrink-0">
                        <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product.id}`} className="font-body-md text-on-surface hover:text-primary transition-colors line-clamp-2">
                          {item.product.title}
                        </Link>
                        <div className="text-body-sm text-on-surface-variant mt-1">Phân loại: {item.variant}</div>
                        <div className="text-body-sm text-on-surface-variant mt-1">x{item.quantity}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-price-md text-on-surface">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="font-body-sm text-on-surface-variant text-center sm:text-left w-full sm:w-auto">
                    Đặt ngày: <span className="text-on-surface">{order.createdAt}</span>
                  </div>
                  <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-on-surface">Thành tiền:</span>
                      <span className="font-price-lg text-primary text-xl font-bold">{formatPrice(order.totalAmount)}</span>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      {order.status === "shipping" && (
                        <>
                          <Link href={`/orders/${order.id}`} className="flex-1 sm:flex-none">
                            <Button variant="primary" className="w-full">Theo dõi đơn hàng</Button>
                          </Link>
                          <Button variant="outline" className="flex-1 sm:flex-none hidden sm:flex">Liên hệ</Button>
                        </>
                      )}
                      
                      {order.status === "delivered" && (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
