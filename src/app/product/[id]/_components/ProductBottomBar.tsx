"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCart } from "@/hooks/api/useCart";
import { useCreateDraft } from "@/hooks/api/useOrders";
import { useStartConversation } from "@/hooks/api/useChat";
import { toast } from "react-hot-toast";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductBottomBar({
  product,
  selectedVariant,
}: {
  product: ListingDetail;
  selectedVariant: Variant;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { addItem } = useCart();
  const createDraft = useCreateDraft();
  const startConversation = useStartConversation();

  const requireSignIn = (message: string): boolean => {
    if (isAuthenticated) return false;
    toast.error(message);
    router.push(`/login?callbackUrl=/product/${product.id}`);
    return true;
  };

  const handleBuyNow = () => {
    if (requireSignIn("Vui lòng đăng nhập để mua hàng")) return;

    createDraft.mutate(
      { listing_id: product.id }, // Currently backend creates draft for the listing, backend checkout request takes variant_ids
      // Wait, let's verify if createDraft takes variant_id. Looking at the openapi specs, CreateDraftRequest only takes listing_id.
      // The actual variant is selected during checkout.
      { onSuccess: (draft) => router.push(`/checkout?draft_id=${draft.id}`) },
    );
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      await addItem(product.id, selectedVariant.id, 1);
      toast.success("Đã thêm vào giỏ hàng.");
    } catch {
      // The global handler raises the toast.
    }
  };

  const handleNegotiate = () => {
    if (requireSignIn("Vui lòng đăng nhập để thương lượng")) return;
    
    startConversation.mutate(
      { account_id: product.seller.id },
      {
        onSuccess: (conversation) => {
          router.push(`/inbox?c=${conversation.id}&listing_id=${product.id}&action=offer&variant_id=${selectedVariant.id}`);
        },
        onError: () => {
          toast.error("Không thể mở cuộc trò chuyện");
        }
      }
    );
  };

  const isNegotiable = product.price_mode === "negotiable";
  const isOutOfStock = selectedVariant.stock?.available === 0;

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
          <Button variant="outline" className="px-6 py-3 shrink-0 h-12 rounded-xl text-on-surface">
            <span className="material-symbols-outlined mr-2">favorite</span>
            Lưu
          </Button>

          {isNegotiable ? (
            <Button 
              variant="primary" 
              className="flex-1 sm:flex-none px-8 py-3 h-12 rounded-xl font-bold"
              onClick={handleNegotiate}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Hết hàng" : "Thương lượng"}
            </Button>
          ) : (
            <>
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
                {createDraft.isPending ? "Đang xử lý..." : (isOutOfStock ? "Hết hàng" : "Mua ngay")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
