"use client";

import Button from "@/components/ui/Button";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

/**
 * What a negotiable listing offers, now that both are open.
 *
 * A negotiable price no longer *requires* an offer — the asking price is takeable, like on
 * any other listing — so the choice belongs to the buyer and has to be asked rather than
 * decided for them. Buying goes straight to a draft and the ordinary checkout; negotiating
 * sends an offer and moves the conversation to the thread the pair already share.
 */
export default function NegotiableChoiceModal({
  isOpen,
  onClose,
  price,
  onBuyNow,
  onNegotiate,
  isBuying = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  onBuyNow: () => void;
  onNegotiate: () => void;
  isBuying?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-2xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-headline-sm font-bold text-on-surface">Bạn muốn mua thế nào?</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-body-sm text-on-surface-variant">
            Người bán cho phép thương lượng, nhưng bạn vẫn có thể mua ngay với giá niêm yết.
          </p>

          <button
            type="button"
            onClick={onBuyNow}
            disabled={isBuying}
            className="text-left border border-primary rounded-2xl p-4 hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-on-surface">Mua ngay với giá niêm yết</span>
              <span className="font-bold text-primary shrink-0">{formatPrice(price)}</span>
            </div>
            <span className="block text-body-sm text-on-surface-variant mt-1">
              {isBuying ? "Đang tạo phiên mua hàng..." : "Sang bước thanh toán, không cần chờ người bán."}
            </span>
          </button>

          <button
            type="button"
            onClick={onNegotiate}
            className="text-left border border-outline-variant rounded-2xl p-4 hover:border-primary transition-colors cursor-pointer"
          >
            <span className="font-bold text-on-surface">Thương lượng giá</span>
            <span className="block text-body-sm text-on-surface-variant mt-1">
              Gửi đề nghị giá cho người bán. Đơn hàng chỉ được tạo sau khi bạn thanh toán.
            </span>
          </button>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant flex justify-end bg-surface-container-lowest">
          <Button variant="outline" type="button" onClick={onClose}>
            Để sau
          </Button>
        </div>
      </div>
    </div>
  );
}
