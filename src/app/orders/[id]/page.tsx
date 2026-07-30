import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { mockOrderPage } from "@/lib/mocks/order.mock";
import { ORDER_STATE_VI } from "@/lib/dictionaries";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;
  const order = mockOrderPage.items.find(o => o.id === orderId) || mockOrderPage.items[0]; // Fallback to first order if not found

  // Calculate totals
  const totalAmount = order.items?.reduce((sum, item) => sum + item.total_amount, 0) || 0;
  const shippingFee = 35000; // Mock

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        
        {/* Back Navigation */}
        <Link href="/orders" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-md">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Quay lại Đơn mua
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left Column: Tracking & Items ── */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Status Stepper */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-outline-variant border-dashed pb-4">
                <h2 className="font-headline-sm font-bold">Trạng thái đơn hàng</h2>
                <span className="font-label-md text-primary font-bold uppercase">{ORDER_STATE_VI[order.state] || order.state}</span>
              </div>
              
              {/* Stepper Logic (Simplified Mock) */}
              <div className="relative pt-2 pb-8 px-4 sm:px-12">
                <div className="absolute top-5 left-4 sm:left-12 right-4 sm:right-12 h-1 bg-surface-container-high rounded">
                  <div className="h-full bg-primary rounded w-3/4"></div>
                </div>
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface">
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-primary text-center">Đã đặt đơn</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-primary text-center">Đã xác nhận</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface">
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-primary text-center">Đang giao</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface">
                      <span className="material-symbols-outlined text-[16px]">home</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-on-surface-variant text-center">Nhận hàng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant">
                <h3 className="font-headline-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">store</span>
                  Shop {order.seller_id}
                </h3>
                <Button variant="outline" size="sm" icon={<span className="material-symbols-outlined">chat</span>}>
                  Liên hệ Shop
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {order.items?.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded border border-outline-variant overflow-hidden shrink-0 bg-surface-container">
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
            </div>
          </div>

          {/* ── Right Column: Info & Summary ── */}
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
            
            {/* Delivery Info */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Địa chỉ nhận hàng</h3>
              <div className="flex flex-col gap-1 text-body-sm text-on-surface mb-6">
                <div className="font-bold mb-1">{order.address?.full_name || 'Khách hàng'}</div>
                <div>{order.address?.phone || ''}</div>
                <div className="text-on-surface-variant leading-relaxed">
                  {order.address?.address_detail}, {order.address?.address}
                </div>
              </div>

              <h3 className="font-headline-sm font-bold mb-4">Thông tin vận chuyển</h3>
              <div className="flex flex-col gap-1 text-body-sm text-on-surface">
                <div>Đơn vị: <span className="font-bold">Giao Hàng Nhanh</span></div>
                <div>Mã vận đơn: <span className="font-bold">{order.transport_id}</span></div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Thông tin thanh toán</h3>
              <div className="flex flex-col gap-3 text-body-sm text-on-surface-variant border-b border-outline-variant pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng</span>
                  <span className="text-on-surface">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-on-surface">{formatPrice(shippingFee)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-md text-on-surface">Thành tiền</span>
                <span className="font-price-lg text-primary text-xl font-bold">{formatPrice(totalAmount + shippingFee)}</span>
              </div>
              <div className="text-right text-xs text-on-surface-variant mt-1 mb-6">
                Thanh toán khi nhận hàng
              </div>

              <div className="flex flex-col gap-2 border-t border-outline-variant pt-6">
                <Button variant="outline" fullWidth>Yêu cầu Hóa đơn</Button>
                {order.state !== "completed" && (
                  <Button variant="ghost" fullWidth className="text-error hover:text-error hover:bg-error-container/20">
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
