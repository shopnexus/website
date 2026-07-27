import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { ORDERS, formatPrice } from "@/lib/mock-data";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;
  const order = ORDERS.find(o => o.id === orderId) || ORDERS[0]; // Fallback to first order if not found

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
                <span className="font-label-md text-primary font-bold">ĐANG GIAO HÀNG</span>
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
                    <span className="text-[10px] sm:text-xs font-bold text-primary text-center">Đã đặt đơn<br/>12 Th10</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-primary text-center">Đã xác nhận<br/>12 Th10</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface">
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-primary text-center">Đang giao<br/>Hôm nay</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface">
                      <span className="material-symbols-outlined text-[16px]">home</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-on-surface-variant text-center">Nhận hàng<br/>Dự kiến 14 Th10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-headline-sm font-bold mb-6">Lịch sử giao hàng</h3>
                <div className="flex flex-col gap-6 ml-2 border-l-2 border-surface-container-high">
                  {order.trackingHistory.map((event, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className={["absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border-[4px] border-surface", event.isActive ? "bg-primary" : "bg-surface-container-high"].join(" ")}></div>
                      <div className={["font-label-md mb-1", event.isActive ? "text-primary font-bold" : "text-on-surface"].join(" ")}>{event.title}</div>
                      {event.description && <div className="text-body-sm text-on-surface-variant mb-1">{event.description}</div>}
                      <div className="text-xs text-on-surface-variant">{event.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant">
                <h3 className="font-headline-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">store</span>
                  {order.seller.name}
                </h3>
                <Button variant="outline" size="sm" icon={<span className="material-symbols-outlined">chat</span>}>
                  Liên hệ Shop
                </Button>
              </div>

              <div className="flex flex-col gap-4">
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
            </div>
          </div>

          {/* ── Right Column: Info & Summary ── */}
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
            
            {/* Delivery Info */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Địa chỉ nhận hàng</h3>
              <div className="flex flex-col gap-1 text-body-sm text-on-surface mb-6">
                <div className="font-bold mb-1">Nguyễn Văn An</div>
                <div>0901234567</div>
                <div className="text-on-surface-variant leading-relaxed">
                  Tòa nhà The Nexus, 3A-3B Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </div>
              </div>

              <h3 className="font-headline-sm font-bold mb-4">Thông tin vận chuyển</h3>
              <div className="flex flex-col gap-1 text-body-sm text-on-surface">
                <div>Đơn vị: <span className="font-bold">{order.shippingMethod}</span></div>
                <div>Mã vận đơn: <span className="font-bold">GHN192837465VN</span></div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Thông tin thanh toán</h3>
              <div className="flex flex-col gap-3 text-body-sm text-on-surface-variant border-b border-outline-variant pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng</span>
                  <span className="text-on-surface">{formatPrice(order.totalAmount - order.shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-on-surface">{formatPrice(order.shippingFee)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-md text-on-surface">Thành tiền</span>
                <span className="font-price-lg text-primary text-xl font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="text-right text-xs text-on-surface-variant mt-1 mb-6">
                Thanh toán khi nhận hàng
              </div>

              <div className="flex flex-col gap-2 border-t border-outline-variant pt-6">
                <Button variant="outline" fullWidth>Yêu cầu Hóa đơn</Button>
                {order.status !== "delivered" && (
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
