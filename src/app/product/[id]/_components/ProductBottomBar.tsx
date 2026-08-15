"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import OfferModal from "@/components/offers/OfferModal";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCart } from "@/hooks/api/useCart";
import { useCreateDraft } from "@/hooks/api/useOrders";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/api/useCatalog";
import { useStartConversation } from "@/hooks/api/useChat";
import { toast } from "react-hot-toast";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import NegotiableChoiceModal from "./NegotiableChoiceModal";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductBottomBar({
  product,
  selectedVariant,
}: {
  product: ListingDetail;
  /** The variant the page's classification picker has chosen — what every action acts on. */
  selectedVariant: Variant;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { addItem } = useCart();
  const createDraft = useCreateDraft();
  const startConversation = useStartConversation();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const handleOfferSuccess = () => {
    startConversation.mutate(
      { account_id: product.seller.id },
      {
        onSuccess: (conversation) => {
          router.push(`/inbox?c=${conversation.id}&listing_id=${product.id}`);
        }
      }
    );
  };

  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const isNegotiable = product.price_mode === "negotiable";
  const isOutOfStock = selectedVariant.stock.available <= 0;

  // Không ai mua được tin của chính mình — server chặn ở draft, ở giỏ hàng và ở cả
  // thương lượng — nên thanh này không bày ra ba cái nút chỉ để dẫn tới một 403.
  // Chỗ đó dành cho việc người bán thật sự làm được ở đây: sửa tin.
  if (user?.id === product.seller.id) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 p-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-label-md text-on-surface-variant">
            <span className="material-symbols-outlined">storefront</span>
            Đây là tin đăng của bạn
          </span>
          <Link href={`/account/products/${product.id}`}>
            <Button variant="primary" className="px-8 py-3 h-12 rounded-xl font-bold">
              Chỉnh sửa tin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const requireSignIn = (message: string): boolean => {
    if (isAuthenticated) return false;
    toast.error(message);
    router.push(`/login?callbackUrl=/product/${product.id}`);
    return true;
  };

  // The draft is opened for the listing: `CreateDraftRequest` takes only `listing_id` and
  // the variant is picked at checkout.
  const buyAtAskingPrice = () => {
    createDraft.mutate(
      { listing_id: product.id },
      { onSuccess: (draft) => router.push(`/checkout?draft_id=${draft.id}`) },
    );
  };

  /**
   * A negotiable listing is buyable at the asking price like any other, so pressing "buy"
   * asks which of the two the buyer meant rather than routing them into a negotiation.
   */
  const handleBuyNow = () => {
    if (requireSignIn("Vui lòng đăng nhập để mua hàng")) return;
    if (isNegotiable) {
      setIsChoiceOpen(true);
      return;
    }
    buyAtAskingPrice();
  };

  const handleAddToCart = async () => {
    try {
      // A guest's cart lives in the store and is merged server-side at sign-in, so this
      // works signed out too.
      await addItem(product.id, selectedVariant.id, 1);
      toast.success("Đã thêm vào giỏ hàng.");
    } catch {
      // The global handler raises the toast.
    }
  };

  const handleNegotiate = () => {
    if (requireSignIn("Vui lòng đăng nhập để thương lượng")) return;
    setIsChoiceOpen(false);
    setIsOfferOpen(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 p-4">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        <div className="hidden sm:flex items-center gap-4">
          <span className="font-label-md text-on-surface-variant">Tổng thanh toán:</span>
          <span className="font-display-lg text-[24px] text-primary font-bold leading-none">
            {formatPrice(selectedVariant.price)}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* The product card in every listing grid has toggled favourites all along; the
              detail page — where someone actually decides to keep something — had the
              button drawn and wired to nothing. */}
          <Button
            variant="outline"
            className="px-6 py-3 shrink-0 h-12 rounded-xl text-on-surface"
            disabled={addFavorite.isPending || removeFavorite.isPending}
            aria-pressed={product.favorited}
            onClick={() => {
              if (requireSignIn("Vui lòng đăng nhập để lưu sản phẩm")) return;
              const toggle = product.favorited ? removeFavorite : addFavorite;
              toggle.mutate(product.id, {
                onSuccess: () =>
                  toast.success(product.favorited ? "Đã bỏ lưu" : "Đã lưu sản phẩm"),
              });
            }}
          >
            <span
              className="material-symbols-outlined mr-2"
              style={{ fontVariationSettings: product.favorited ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            {product.favorited ? "Đã lưu" : "Lưu"}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none px-6 py-3 h-12 rounded-xl text-on-secondary-container"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            Thêm vào giỏ
          </Button>

          <Button
            variant="primary"
            className="flex-1 sm:flex-none px-8 py-3 h-12 rounded-xl font-bold"
            onClick={handleBuyNow}
            disabled={createDraft.isPending || isOutOfStock}
          >
            {isOutOfStock ? "Hết hàng" : createDraft.isPending ? "Đang xử lý..." : "Mua ngay"}
          </Button>
        </div>
      </div>

      <NegotiableChoiceModal
        isOpen={isChoiceOpen}
        onClose={() => setIsChoiceOpen(false)}
        price={selectedVariant.price}
        onBuyNow={buyAtAskingPrice}
        onNegotiate={handleNegotiate}
        isBuying={createDraft.isPending}
      />

      <OfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        product={product}
        variant={selectedVariant}
        onSuccessCallback={handleOfferSuccess}
      />
    </div>
  );
}
