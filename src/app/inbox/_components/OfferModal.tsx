"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useCreateOffer } from "@/hooks/api/useOffers";
import { ApiError } from "@/api/api-error";
import type { ListingDetail } from "@/api/generated/types.gen";
import { toast } from "react-hot-toast";

export default function OfferModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ListingDetail | null;
}) {
  const [total, setTotal] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");

  const createOffer = useCreateOffer();

  if (!isOpen || !product) return null;

  const targetVariant = product.variants.find((v) => v.is_featured) ?? product.variants[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVariant) return;

    const parsedTotal = parseInt(total.replace(/\D/g, ""), 10);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      toast.error("Vui lòng nhập giá trị hợp lệ");
      return;
    }

    createOffer.mutate(
      {
        variant_id: targetVariant.id,
        quantity: quantity,
        total: parsedTotal,
        reason: reason || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi đề nghị giá");
          onClose();
          setTotal("");
          setQuantity(1);
          setReason("");
        },
        onError: (err) => {
          // The interceptor normalises every failure into an ApiError, so the code is a
          // field rather than something to dig out of a response body.
          const code = err instanceof ApiError ? err.code : undefined;
          toast.error(
            code === "offer_already_open"
              ? "Bạn đã có một đề nghị giá đang chờ xử lý cho sản phẩm này."
              : "Không thể gửi đề nghị giá",
          );
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-2xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-headline-sm font-bold text-on-surface">Đề nghị giá</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6">
            {product.images?.[0]?.url && (
              <img src={product.images[0].url} alt="" className="w-16 h-16 rounded-lg object-cover border border-outline-variant" />
            )}
            <div>
              <p className="font-bold text-sm text-on-surface line-clamp-2">{product.name}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Giá gốc: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(targetVariant?.price || 0)}
              </p>
            </div>
          </div>

          <form id="offer-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Giá đề nghị (VND)</label>
              <input
                type="text"
                required
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="Ví dụ: 500000"
                className="w-full px-4 py-2 bg-surface-container rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Số lượng</label>
              <input
                type="number"
                required
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 bg-surface-container rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Lời nhắn (tùy chọn)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Thương lượng thêm..."
                rows={3}
                className="w-full px-4 py-2 bg-surface-container rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
          <Button variant="outline" onClick={onClose} type="button">Hủy</Button>
          <Button variant="primary" type="submit" form="offer-form" disabled={createOffer.isPending}>
            {createOffer.isPending ? "Đang gửi..." : "Gửi đề nghị"}
          </Button>
        </div>
      </div>
    </div>
  );
}
