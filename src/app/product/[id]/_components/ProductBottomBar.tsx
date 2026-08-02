"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { OrderService } from "@/services/order.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "react-hot-toast";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductBottomBar({ product }: { product: any }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isBuying, setIsBuying] = useState(false);

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      router.push(`/login?callbackUrl=/product/${product.id}`);
      return;
    }

    try {
      setIsBuying(true);
      const res = await OrderService.createDraftOrder({ listing_id: product.id });
      router.push(`/checkout?draft_id=${res.data.id}`);
    } catch (error) {
      // apiClient handles toast
    } finally {
      setIsBuying(false);
    }
  };

  const handleNegotiate = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thương lượng");
      router.push(`/login?callbackUrl=/product/${product.id}`);
      return;
    }
    // Lógica thương lượng - có thể là mở modal thương lượng
    toast.error("Chức năng thương lượng đang được phát triển");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 p-4">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        <div className="hidden sm:flex items-center gap-4">
          <span className="font-label-md text-on-surface-variant">Tổng thanh toán:</span>
          <span className="font-display-lg text-[24px] text-primary font-bold leading-none">
            {formatPrice(product.skus?.[0]?.price || 0)}
          </span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="px-6 py-3 shrink-0 h-12 rounded-xl text-on-surface">
            <span className="material-symbols-outlined mr-2">favorite</span>
            Lưu
          </Button>
          <Button variant="secondary" className="flex-1 sm:flex-none px-6 py-3 h-12 rounded-xl text-on-secondary-container">
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
            disabled={isBuying}
          >
            {isBuying ? "Đang xử lý..." : "Mua ngay"}
          </Button>
        </div>
      </div>
    </div>
  );
}
