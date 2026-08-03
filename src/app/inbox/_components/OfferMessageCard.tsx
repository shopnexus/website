"use client";

import { useOffer, useAcceptOffer, useCheckoutOffer, useCancelOffer } from "@/hooks/api/useOffers";
import { useListing } from "@/hooks/api/useCatalog";
import { useAuthStore } from "@/stores/use-auth-store";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function OfferMessageCard({ offerId }: { offerId: string }) {
  const { data: offer, isLoading: isLoadingOffer } = useOffer(offerId);
  const { data: product } = useListing(offer?.listing_id);
  const user = useAuthStore((s) => s.user);

  const acceptOffer = useAcceptOffer();
  const checkoutOffer = useCheckoutOffer();
  const cancelOffer = useCancelOffer();

  if (isLoadingOffer) {
    return <div className="p-4 bg-surface-container rounded-xl animate-pulse w-64 h-32"></div>;
  }

  if (!offer) {
    return <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm text-center">Không thể tải đề nghị giá</div>;
  }

  const isSeller = user?.id === offer.seller_id;
  const isBuyer = user?.id === offer.buyer_id;

  const handleAccept = () => {
    acceptOffer.mutate(offer.id, {
      onSuccess: () => toast.success("Đã chấp nhận đề nghị giá"),
      onError: () => toast.error("Có lỗi xảy ra khi chấp nhận"),
    });
  };

  const handleReject = () => {
    cancelOffer.mutate({ id: offer.id }, {
      onSuccess: () => toast.success("Đã từ chối/hủy đề nghị giá"),
      onError: () => toast.error("Có lỗi xảy ra"),
    });
  };

  const handleCheckout = () => {
    // For now, since checkout needs contact and shipping, we could just alert
    // or we could redirect to a specialized checkout route if it existed.
    // In a real app, we'd open a modal here to select address and shipping.
    toast.error("Vui lòng thanh toán từ giỏ hàng hoặc trang thanh toán (chưa hoàn thiện UI)");
    
    /* 
    checkoutOffer.mutate({
      id: offer.id,
      body: { contact_id: "...", transport_option: "..." }
    })
    */
  };

  const statusLabels: Record<string, string> = {
    "active": "Đang chờ phản hồi",
    "accepted": "Đã chấp nhận",
    "checked-out": "Đã thanh toán",
    "cancelled": "Đã hủy",
  };

  const statusColors: Record<string, string> = {
    "active": "text-secondary font-bold",
    "accepted": "text-primary font-bold",
    "checked-out": "text-green-600 font-bold",
    "cancelled": "text-error font-bold",
  };

  return (
    <div className="w-[280px] bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
        <span className="font-bold text-sm text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">handshake</span>
          Đề nghị giá
        </span>
        <span className={`text-[11px] uppercase tracking-wider ${statusColors[offer.status]}`}>
          {statusLabels[offer.status]}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        {product && (
          <div className="flex items-center gap-3">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover border border-outline-variant shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-surface-container shrink-0"></div>
            )}
            <p className="text-xs text-on-surface line-clamp-2 leading-snug">{product.name}</p>
          </div>
        )}

        <div className="flex justify-between items-end border-t border-outline-variant/30 pt-3 mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-medium">GIÁ ĐỀ NGHỊ</span>
            <span className="font-display-sm text-primary font-bold">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(offer.total)}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-on-surface-variant font-medium">SỐ LƯỢNG</span>
            <span className="font-bold text-sm text-on-surface">x{offer.quantity}</span>
          </div>
        </div>

        {offer.reason && (
          <div className="mt-2 border-l-2 border-primary/30 pl-3 py-1">
            <span className="text-[10px] text-on-surface-variant font-medium block mb-0.5">LỜI NHẮN</span>
            <p className="text-xs text-on-surface whitespace-pre-wrap break-words italic">{offer.reason}</p>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="px-4 pb-4">
        {isSeller && offer.status === "active" && (
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              fullWidth
              onClick={handleAccept}
              disabled={acceptOffer.isPending || cancelOffer.isPending}
              className="rounded-xl py-2"
            >
              {acceptOffer.isPending ? "Đang xử lý..." : "Chấp nhận giá"}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={handleReject}
              disabled={cancelOffer.isPending || acceptOffer.isPending}
              className="rounded-xl py-2 !bg-error-container !text-on-error-container hover:!bg-error/20"
            >
              {cancelOffer.isPending ? "Đang xử lý..." : "Từ chối"}
            </Button>
          </div>
        )}

        {isBuyer && offer.status === "active" && (
          <Button
            variant="secondary"
            fullWidth
            onClick={handleReject}
            disabled={cancelOffer.isPending}
            className="rounded-xl py-2 text-on-surface-variant"
          >
            {cancelOffer.isPending ? "Đang xử lý..." : "Hủy đề nghị"}
          </Button>
        )}

        {isBuyer && offer.status === "accepted" && (
          <Button
            variant="secondary"
            fullWidth
            onClick={handleCheckout}
            disabled={checkoutOffer.isPending}
            className="rounded-xl py-2"
          >
            Tiến hành thanh toán
          </Button>
        )}
      </div>
    </div>
  );
}
