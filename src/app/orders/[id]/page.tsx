import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import { TRANSPORT_STATUS_VI } from "@/lib/dictionaries";
import { orderStatusLabel } from "@/lib/order-state";
import { getListings, getOrdersById } from "@/api/generated/sdk.gen";
import type { Listing, ListingId, OrderId, TransportStatus } from "@/api/generated/types.gen";
import OrderActions from "@/components/orders/OrderActions";
import OrderContactButton from "@/components/orders/OrderContactButton";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

/**
 * The tracker's four stops, and which transport statuses have passed each one.
 *
 * Driven by `order.transport.status` rather than drawn at a fixed three-quarters: a
 * shipment that failed or was returned must not render as "almost delivered".
 */
const STEPS: Array<{ label: string; icon: string; reachedBy: TransportStatus[] }> = [
  { label: "Đã đặt đơn", icon: "receipt_long", reachedBy: [] },
  { label: "Đã lấy hàng", icon: "inventory_2", reachedBy: ["picked-up", "in-transit", "delivered"] },
  { label: "Đang giao", icon: "local_shipping", reachedBy: ["in-transit", "delivered"] },
  { label: "Nhận hàng", icon: "home", reachedBy: ["delivered"] },
];

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await getOrdersById({ path: { id: id as OrderId } });
  if (error || !data) notFound();

  const order = data.data;
  const transport = order.transport;

  // Order lines carry listing_id only; names and covers are resolved in one call.
  const listingIds = [...new Set((order.items ?? []).map((item) => item.listing_id))];
  const listingsById = new Map<ListingId, Listing>();
  if (listingIds.length > 0) {
    const { data: page } = await getListings({ query: { ids: listingIds, limit: 100 } });
    for (const listing of page?.data ?? []) listingsById.set(listing.id, listing);
  }

  const shippingFee = transport?.fee ?? 0;
  const goodsTotal = order.total;

  // Step 0 is always reached — the order exists. The rest follow the shipment.
  const reachedSteps = STEPS.map(
    (step, idx) => idx === 0 || (transport ? step.reachedBy.includes(transport.status) : false),
  );
  const progress = (reachedSteps.filter(Boolean).length - 1) / (STEPS.length - 1);

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">

        {/* The unified list, not /orders: both sides of a sale open this page, and the
            buyer-only list is a dead end for the seller who arrived from the dashboard. */}
        <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-md">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Quay lại danh sách đơn
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">

            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-outline-variant border-dashed pb-4">
                <h2 className="font-headline-sm font-bold">Trạng thái đơn hàng</h2>
                {/* The outcome first, then the parcel. Reading the shipment whenever there
                    was one made a cancelled order whose carrier row still said `in-transit`
                    render as if it were on its way. */}
                <span className="font-label-md text-primary font-bold uppercase">
                  {orderStatusLabel(order)}
                </span>
              </div>

              <div className="relative pt-2 pb-8 px-4 sm:px-12">
                <div className="absolute top-5 left-4 sm:left-12 right-4 sm:right-12 h-1 bg-surface-container-high rounded">
                  <div className="h-full bg-primary rounded transition-all" style={{ width: `${progress * 100}%` }}></div>
                </div>
                <div className="relative flex justify-between">
                  {STEPS.map((step, idx) => {
                    const reached = reachedSteps[idx];
                    return (
                      <div key={step.label} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface ${reached ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                          <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                        </div>
                        <span className={`text-[10px] sm:text-xs text-center ${reached ? "font-bold text-primary" : "font-medium text-on-surface-variant"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant">
                <h3 className="font-headline-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">store</span>
                  {order.seller.name}
                </h3>
                <OrderContactButton order={order} size="sm" />
              </div>

              <div className="flex flex-col gap-4">
                {order.items?.map((item) => {
                  const listing = listingsById.get(item.listing_id);
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 rounded border border-outline-variant overflow-hidden shrink-0 bg-surface-container">
                        {listing?.cover?.url && (
                          <Image src={listing.cover.url} alt={listing.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.listing_id}`} className="font-body-md text-on-surface hover:text-primary transition-colors line-clamp-2">
                          {listing?.name ?? "Sản phẩm"}
                        </Link>
                        <div className="text-body-sm text-on-surface-variant mt-1">x{item.quantity}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-price-md text-on-surface">{formatPrice(item.total_amount / item.quantity)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">

            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Địa chỉ nhận hàng</h3>
              <div className="flex flex-col gap-1 text-body-sm text-on-surface mb-6">
                <div className="font-bold mb-1">{order.address.full_name}</div>
                <div>{order.address.phone}</div>
                {/* The snapshot froze administrative codes, not their names — those are
                    display values that belong to the contact, not to the shipment. */}
                <div className="text-on-surface-variant leading-relaxed">
                  {order.address.address_detail}
                </div>
              </div>

              <h3 className="font-headline-sm font-bold mb-4">Thông tin vận chuyển</h3>
              {transport ? (
                <div className="flex flex-col gap-1 text-body-sm text-on-surface">
                  <div>Đơn vị: <span className="font-bold">{transport.option}</span></div>
                  <div>Mã vận đơn: <span className="font-bold">{transport.id}</span></div>
                  <div>Trạng thái: <span className="font-bold">{TRANSPORT_STATUS_VI[transport.status]}</span></div>
                </div>
              ) : (
                <div className="text-body-sm text-on-surface-variant">Chưa có thông tin vận chuyển.</div>
              )}
            </div>

            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Thông tin thanh toán</h3>
              <div className="flex flex-col gap-3 text-body-sm text-on-surface-variant border-b border-outline-variant pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng</span>
                  <span className="text-on-surface">{formatPrice(goodsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-on-surface">{formatPrice(shippingFee)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-md text-on-surface">Thành tiền</span>
                <span className="font-price-lg text-primary text-xl font-bold">{formatPrice(goodsTotal + shippingFee)}</span>
              </div>

              {/* Everything this order's two parties may still do about it, in the one
                  place with enough context to do it — a refund needs a reason and photos,
                  a receipt needs the unboxing evidence. */}
              <div className="flex flex-col gap-2 border-t border-outline-variant pt-6 mt-6">
                <OrderActions order={order} variant="detail" />

                {/* Every problem with an order — a parcel that never came, an item that is
                    not what was described, a payment that went wrong — is a ticket of the
                    matching kind, carrying this order's id. Where the parcel *is* comes
                    from the carrier's webhook and only staff may correct it, so this is
                    what a seller who sees it wrong has instead of a status button. */}
                <Link href={`/support?kind=order-issue&ref_id=${order.id}`} className="block">
                  <Button variant="ghost" fullWidth>
                    Báo cáo sự cố đơn hàng
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
