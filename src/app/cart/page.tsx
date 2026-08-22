"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Skeleton from "@/components/ui/Skeleton";
import ListingCarousel from "@/components/listings/ListingCarousel";
import { useCart, type ResolvedCartItem } from "@/hooks/api/useCart";
import { useListings } from "@/hooks/api/useCatalog";
import { useCreateDraft } from "@/hooks/api/useOrders";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "react-hot-toast";
import type { AccountSummary } from "@/api/generated/types.gen";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

/** A flat placeholder until checkout quotes the real thing per parcel and address. */

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, isLoading, updateQuantity, removeItem } = useCart();
  // Only asked for when there is a hole to fill. An empty cart is a dead end otherwise: a
  // card telling the reader there is nothing here, and half a screen of white under it.
  const suggestions = useListings({ sort: "trending" }, 1, !isLoading && items.length === 0);
  const createDraft = useCreateDraft();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  /**
   * API constraint: A draft (`POST /drafts`) is created for exactly one listing.
   * Therefore, we only allow selecting one listing at a time in the cart.
   */
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (!selectedListingId) {
      toast.error("Vui lòng chọn 1 sản phẩm để thanh toán");
      return;
    }

    setIsCheckingOut(true);
    try {
      const draft = await createDraft.mutateAsync({ listing_id: selectedListingId });
      router.push(`/checkout?draft_id=${draft.id}`);
    } catch {
      // Global error handler shows the toast.
    } finally {
      setIsCheckingOut(false);
    }
  };

  const groupedItems = useMemo(() => {
    const groups = new Map<string, { seller: AccountSummary; items: ResolvedCartItem[] }>();
    for (const item of items) {
      const seller = item.listing.seller;
      const group = groups.get(seller.id) ?? { seller, items: [] };
      group.items.push(item);
      groups.set(seller.id, group);
    }
    return [...groups.values()];
  }, [items]);

  // The cart total is now calculated based on the selected listing
  const selectedItems = items.filter((item) => item.listing.id === selectedListingId);
  const total = selectedItems.reduce((acc, item) => acc + (item.variant?.price ?? 0) * item.quantity, 0);

  // The shape of the page rather than a sentence about waiting: a line of centred text on an
  // otherwise blank screen is indistinguishable from a page that failed.
  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-container-lowest py-8">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <div className="mt-6 flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl lg:w-80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <h1 className="mb-5 font-headline-sm font-bold text-on-surface">Giỏ hàng của bạn</h1>

        {items.length === 0 ? (
          <>
            {/* An empty screen is an invitation, so it names both ways on: find something
                new, or go back to what was already worth saving. */}
            <EmptyState
              icon="shopping_cart"
              title="Giỏ hàng đang trống"
              description="Thêm những món bạn đang cân nhắc vào đây. Mỗi lần thanh toán là một người bán, nên giỏ hàng chỉ giữ chỗ cho tới lúc bạn chọn."
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/search">
                    <Button variant="primary" className="h-11 px-6">
                      Khám phá sản phẩm
                    </Button>
                  </Link>
                  <Link
                    href="/account/favorites"
                    className="font-label-md font-bold text-primary hover:underline"
                  >
                    Xem sản phẩm đã lưu
                  </Link>
                </div>
              }
            />

            {/* Under the invitation, something to accept it with. Without this the page is a
                card saying "nothing here" over half a screen of white — which is the state a
                shopper is most likely to leave from, and the one where the platform has the
                most to say. */}
            {(suggestions.data?.length ?? 0) > 0 && (
              <ListingCarousel
                className="mt-10"
                title="Đang được quan tâm"
                listings={suggestions.data ?? []}
                moreHref="/search"
                moreLabel="Xem tất cả"
              />
            )}
          </>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-6">
              {groupedItems.map((group) => (
                <div key={group.seller.id} className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">storefront</span>
                      <span className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-1">
                        {group.seller.name}
                      </span>
                    </div>
                    <Link href={`/shop/${group.seller.id}`} className="text-primary font-label-md hover:underline flex items-center gap-1">
                      Xem Shop
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                  </div>

                  <div className="flex flex-col">
                    {group.items.map(({ cartItemId, quantity, listing, variant }, iIdx) => {
                      const image = variant?.images[0] ?? listing.images[0];
                      return (
                      <div key={cartItemId} className={["p-6 flex flex-col sm:flex-row gap-4", iIdx > 0 ? "border-t border-outline-variant" : ""].join(" ")}>
                        <div className="flex items-start gap-4">
                          <input
                            type="radio"
                            name="cart-item-selection"
                            checked={listing.id === selectedListingId}
                            onChange={() => setSelectedListingId(listing.id)}
                            className="w-5 h-5 mt-4 rounded-full text-primary border-outline-variant focus:ring-primary focus:ring-offset-background cursor-pointer"
                          />
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant shrink-0">
                            {image?.url ? (
                              <Image src={image.url} alt={listing.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-surface-container flex items-center justify-center">N/A</div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                          <Link href={`/product/${listing.slug}`} className="font-body-md text-on-surface hover:text-primary transition-colors line-clamp-2">
                            {listing.name}
                          </Link>
                          {variant && Object.keys(variant.attributes).length > 0 && (
                            <div className="text-body-sm text-on-surface-variant p-2 bg-surface-container-low rounded-lg inline-block self-start">
                              Phân loại: {Object.values(variant.attributes).join(", ")}
                            </div>
                          )}
                          {!variant && (
                            // The variant is gone but the line survives: the shopper has to
                            // be told rather than shown a silent 0 ₫.
                            <div className="text-body-sm text-error">
                              Phiên bản này không còn được bán.
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 mt-2 sm:mt-0 shrink-0">
                            <div className="font-price-md text-primary mt-2">
                              {formatPrice(variant?.price ?? 0)}
                            </div>
                          <QuantitySelector
                            value={quantity}
                            onChange={(val) => updateQuantity(cartItemId, val)}
                          />
                          <button
                            onClick={() => removeItem(cartItemId)}
                            className="text-error hover:opacity-80 transition-opacity p-2 -mr-2"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>

            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-surface rounded-2xl border border-outline-variant p-6 sticky top-24 shadow-sm">
                <h2 className="font-headline-sm font-bold mb-6">Tóm tắt đơn hàng</h2>
                
                <div className="flex flex-col gap-4 text-body-md text-on-surface-variant border-b border-outline-variant pb-6 mb-6">
                  <div className="flex justify-between">
                    <span>Tạm tính ({selectedItems.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm)</span>
                    <span className="text-on-surface font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="text-on-surface-variant">Tính ở bước thanh toán</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-6">
                  <span className="font-label-md text-on-surface">Tạm tính</span>
                      <span className="font-display-lg text-primary leading-none">
                    {formatPrice(total)}
                  </span>
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={isCheckingOut || !selectedListingId}
                  onClick={handleCheckout}
                >
                  {isCheckingOut ? "Đang tạo đơn hàng..." : "Thanh toán"}
                </Button>
                
                <div className="mt-6 p-4 bg-surface-container-low rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
                  <div>
                    <h4 className="font-label-md text-on-surface mb-1">Thanh toán an toàn</h4>
                    <p className="font-body-sm text-on-surface-variant">ShopNexus giữ tiền của bạn cho đến khi bạn xác nhận đã nhận hàng thành công.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
