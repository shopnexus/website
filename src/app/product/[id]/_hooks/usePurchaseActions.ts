"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCart } from "@/hooks/api/useCart";
import { useCreateDraft } from "@/hooks/api/useOrders";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/api/useCatalog";
import { useStartConversation } from "@/hooks/api/useChat";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";

/**
 * Everything the buy controls do, in one place.
 *
 * The page offers those controls twice — in the panel beside the photos and in the bar that
 * appears once that panel scrolls away — and two copies of "press buy" is how the two drift:
 * both have to open the same draft, refuse the same seller's own listing, and mean the same
 * thing on a negotiable price. So the state — whether the offer form is open, whether a draft is
 * in flight — lives here and both renderings read it.
 */
export function usePurchaseActions(product: ListingDetail, selectedVariant: Variant) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { addItem } = useCart();
  const createDraft = useCreateDraft();
  const startConversation = useStartConversation();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const [offerOpen, setOfferOpen] = useState(false);

  const isNegotiable = product.price_mode === "negotiable";
  const isOutOfStock = selectedVariant.stock.available <= 0;
  const isOwn = user?.id === product.seller.id;
  const favoriteBusy = addFavorite.isPending || removeFavorite.isPending;

  const requireSignIn = (message: string): boolean => {
    if (isAuthenticated) return false;
    toast.error(message);
    router.push(`/login?callbackUrl=/product/${product.id}`);
    return true;
  };

  /**
   * Straight to checkout at the asking price, negotiable or not.
   *
   * A negotiable listing used to answer this press with a dialog asking whether the buyer
   * meant to buy or to negotiate. That is a confirmation for an unambiguous action: they
   * pressed "buy". The two paths are two controls now — the badge beside the price says the
   * seller will talk, and the button under the CTAs is how you talk to them — so the
   * interstitial was asking a question the page already answered.
   *
   * The draft is opened for the listing: `CreateDraftRequest` takes only `listing_id`, and the
   * variant and the quantity are picked at checkout.
   */
  const buyNow = () => {
    if (requireSignIn("Vui lòng đăng nhập để mua hàng")) return;
    createDraft.mutate(
      { listing_id: product.id },
      { onSuccess: (draft) => router.push(`/checkout?draft_id=${draft.id}`) },
    );
  };

  const addToCart = async (quantity = 1) => {
    try {
      // A guest's cart lives in the store and is merged server-side at sign-in, so this
      // works signed out too.
      await addItem(product.id, selectedVariant.id, quantity);
      toast.success(
        quantity > 1 ? `Đã thêm ${quantity} sản phẩm vào giỏ hàng.` : "Đã thêm vào giỏ hàng.",
      );
    } catch {
      // The global handler raises the toast.
    }
  };

  const negotiate = () => {
    if (requireSignIn("Vui lòng đăng nhập để thương lượng")) return;
    setOfferOpen(true);
  };

  const toggleFavorite = () => {
    if (requireSignIn("Vui lòng đăng nhập để lưu sản phẩm")) return;
    if (favoriteBusy) return;
    const toggle = product.favorited ? removeFavorite : addFavorite;
    toggle.mutate(product.id, {
      onSuccess: () => toast.success(product.favorited ? "Đã bỏ lưu" : "Đã lưu sản phẩm"),
      onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
    });
  };

  /** After an offer is sent, the negotiation continues in the thread the pair already share. */
  const openNegotiationThread = () => {
    startConversation.mutate(
      { account_id: product.seller.id },
      {
        onSuccess: (conversation) =>
          router.push(`/inbox?c=${conversation.id}&listing_id=${product.id}`),
      },
    );
  };

  return {
    isOwn,
    isNegotiable,
    isOutOfStock,
    isBuying: createDraft.isPending,
    favoriteBusy,
    offerOpen,
    setOfferOpen,
    buyNow,
    addToCart,
    negotiate,
    toggleFavorite,
    openNegotiationThread,
  };
}

export type PurchaseActions = ReturnType<typeof usePurchaseActions>;
