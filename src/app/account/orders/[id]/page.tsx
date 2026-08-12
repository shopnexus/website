import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import OrderContactButton from "@/components/orders/OrderContactButton";
import OrderRefundNotice from "@/components/orders/OrderRefundNotice";
import OrderProgress from "./components/OrderProgress";
import OrderShipping from "./components/OrderShipping";
import OrderPayment from "./components/OrderPayment";
import { getListings, getOrdersById } from "@/api/generated/sdk.gen";
import type { Listing, ListingId, OrderId } from "@/api/generated/types.gen";

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(price);

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await getOrdersById({ path: { id: id as OrderId } });
  if (error || !data) notFound();

  const order = data.data;

  // Order lines carry listing_id only; names and covers are resolved in one call.
  const listingIds = [...new Set((order.items ?? []).map((item) => item.listing_id))];
  const listingsById = new Map<ListingId, Listing>();
  if (listingIds.length > 0) {
    const { data: page } = await getListings({ query: { ids: listingIds, limit: 100 } });
    for (const listing of page?.data ?? []) listingsById.set(listing.id, listing);
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">

        <Link href="/account/orders" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-md">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Quay lại danh sách đơn
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">

            <OrderProgress order={order} />

            <OrderRefundNotice order={order} />

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
                        <div className="font-price-md text-on-surface">
                          {formatPrice(item.total_amount / item.quantity, item.currency)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
            <OrderShipping order={order} />
            <OrderPayment order={order} />
          </div>

        </div>
      </div>
    </div>
  );
}
