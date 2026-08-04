"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import OfferModal from "@/components/offers/OfferModal";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCart } from "@/hooks/api/useCart";
import { useCreateDraft } from "@/hooks/api/useOrders";
import { toast } from "react-hot-toast";
import type { ListingDetail } from "@/api/generated/types.gen";
import NegotiableChoiceModal from "./NegotiableChoiceModal";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductBottomBar({
  product,
  price,
}: {
  product: ListingDetail;
  /** The featured variant's price, resolved by the page. */
  price: number;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { addItem } = useCart();
  const createDraft = useCreateDraft();

  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  // What "buy" and "add to cart" act on. A listing always has at least one variant —
  // the server refuses to publish one without a priced variant.
  const targetVariant = product.variants.find((v) => v.is_featured) ?? product.variants[0];

  const requireSignIn = (message: string): boolean => {
    if (isAuthenticated) return false;
    toast.error(message);
    router.push(`/login?callbackUrl=/product/${product.id}`);
    return true;
  };

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
    if (product.price_mode === "negotiable") {
      setIsChoiceOpen(true);
      return;
    }
    buyAtAskingPrice();
  };

  const handleAddToCart = async () => {
    if (!targetVariant) return;
    try {
      // A guest's cart lives in the store and is merged server-side at sign-in, so this
      // works signed out too.
      await addItem(product.id, targetVariant.id, 1);
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
            {formatPrice(price)}
          </span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="px-6 py-3 shrink-0 h-12 rounded-xl text-on-surface">
            <span className="material-symbols-outlined mr-2">favorite</span>
            Lưu
          </Button>
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none px-6 py-3 h-12 rounded-xl text-on-secondary-container"
            onClick={handleAddToCart}
            disabled={!targetVariant}
          >
            Thêm vào giỏ
          </Button>

          {product.price_mode === "negotiable" && (
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none px-8 py-3 h-12 rounded-xl font-bold border-primary text-primary"
              onClick={handleNegotiate}
            >
              Thương lượng
            </Button>
          )}

          <Button 
            variant="primary" 
            className="flex-1 sm:flex-none px-8 py-3 h-12 rounded-xl font-bold"
            onClick={handleBuyNow}
            disabled={createDraft.isPending}
          >
            {createDraft.isPending ? "Đang xử lý..." : "Mua ngay"}
          </Button>
        </div>
      </div>

      <NegotiableChoiceModal
        isOpen={isChoiceOpen}
        onClose={() => setIsChoiceOpen(false)}
        price={price}
        onBuyNow={buyAtAskingPrice}
        onNegotiate={handleNegotiate}
        isBuying={createDraft.isPending}
      />

      <OfferModal isOpen={isOfferOpen} onClose={() => setIsOfferOpen(false)} product={product} />
    </div>
  );
}
