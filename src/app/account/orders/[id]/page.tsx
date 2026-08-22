import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AccountPage from "@/components/account/AccountPage";
import OrderContactButton from "@/components/orders/OrderContactButton";
import OrderProgress from "./components/OrderProgress";
import OrderShipping from "./components/OrderShipping";
import OrderPayment from "./components/OrderPayment";
import OrderReceipt from "./components/OrderReceipt";
import OrderTimeline from "./components/OrderTimeline";
import { CARD_SHELL } from "../components/rowShell";
import { getListings, getMe, getOrdersById } from "@/api/generated/sdk.gen";
import type { Listing, ListingId, OrderId } from "@/api/generated/types.gen";

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(price);

/** The same row is a purchase to one side and a sale to the other, so "back" differs. */
async function viewerIsSeller(sellerId: string): Promise<boolean> {
  const store = await cookies();
  if (!store.get("refresh_token")) return false;
  try {
    const { data } = await getMe({ throwOnError: true });
    return data.data.id === sellerId;
  } catch {
    return false;
  }
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await getOrdersById({ path: { id: id as OrderId } });
  if (error || !data) notFound();

  const order = data.data;
  const items = order.items ?? [];

  // Order lines carry listing_id only; names and covers are resolved in one call.
  const listingIds = [...new Set(items.map((item) => item.listing_id))];
  const listingsById = new Map<ListingId, Listing>();
  if (listingIds.length > 0) {
    const { data: page } = await getListings({ query: { ids: listingIds, limit: 100 } });
    for (const listing of page?.data ?? []) listingsById.set(listing.id, listing);
  }

  // The title says what was bought. The id was the h1 before — the largest text on the page
  // was an opaque token nobody reads, while the goods were three cards down.
  const isSeller = await viewerIsSeller(order.seller.id);
  const firstName = listingsById.get(items[0]?.listing_id)?.name;
  const title =
    items.length === 1 && firstName
      ? firstName
      : items.length > 1
        ? `${items.length} sản phẩm`
        : "Đơn hàng";

  return (
    <AccountPage
      title={title}
      description={`${isSeller ? order.buyer.name : order.seller.name} · ${new Date(order.created_at).toLocaleDateString("vi-VN")} · ${order.id}`}
      width="wide"
      actions={
        <Link
          href={isSeller ? "/account/sales" : "/account/orders"}
          className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            arrow_back
          </span>
          {isSeller ? "Đơn bán" : "Đơn mua"}
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <OrderProgress order={order} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="flex flex-col gap-6 min-w-0">
            <div className={`${CARD_SHELL} p-5 md:p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                {isSeller ? (
                  <p className="text-title-md text-on-surface truncate">{order.buyer.name}</p>
                ) : (
                  <Link
                    href={`/shop/${order.seller.id}`}
                    className="text-title-md text-on-surface hover:text-primary transition-colors truncate"
                  >
                    {order.seller.name}
                  </Link>
                )}
                <OrderContactButton order={order} size="sm" />
              </div>

              <ul className="flex flex-col divide-y divide-outline-variant">
                {items.map((item) => {
                  const listing = listingsById.get(item.listing_id);
                  return (
                    <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
                        {listing?.cover?.url && (
                          <Image
                            src={listing.cover.url}
                            alt={listing.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${item.listing_id}`}
                          className="text-body-md text-on-surface hover:text-primary transition-colors line-clamp-2"
                        >
                          {listing?.name ?? "Sản phẩm"}
                        </Link>
                        <p className="text-body-sm text-on-surface-variant mt-0.5 tabular-nums">
                          x{item.quantity}
                        </p>
                      </div>
                      <p className="text-price-md text-on-surface shrink-0">
                        {formatPrice(item.total_amount / item.quantity, item.currency)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <OrderShipping order={order} />
            <OrderReceipt order={order} />
            <OrderTimeline orderId={order.id} />
          </div>

          <OrderPayment order={order} />
        </div>
      </div>
    </AccountPage>
  );
}
