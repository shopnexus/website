"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { Order } from "@/api/generated/types.gen";
import { 
  useConfirmReceipt, 
  useCreateRefund,
  useCancelOrder
} from "@/hooks/api/useOrders";
import { useMe } from "@/hooks/api/useAccount";

interface OrderActionsProps {
  order: Order;
}

export default function OrderActions({ order }: OrderActionsProps) {
  const { data: me } = useMe();
  const confirmReceipt = useConfirmReceipt();
  const createRefund = useCreateRefund();
  const cancelOrder = useCancelOrder();
  
  const [isUploading, setIsUploading] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  if (!me) return null;

  const isSeller = me.id === order.seller.id;
  const isBuyer = me.id === order.buyer.id;
  
  const isBusy = confirmReceipt.isPending || createRefund.isPending || cancelOrder.isPending || isUploading;

  const handleConfirmReceipt = () => {
    // Note: In a real app, this should open a modal to capture unboxing photos (attachments).
    // The spec requires at least 1 attachment for receipt confirmation. 
    // For now, we mock an attachment or prompt the user.
    const hasPhoto = window.confirm("Xác nhận đã nhận hàng?\n\n(Lưu ý: Cần có ảnh/video mở hộp. Bấm OK để mô phỏng tải ảnh lên)");
    if (!hasPhoto) return;
    
    // Using a mocked attachment ID as the API requires at least one attachment
    confirmReceipt.mutate({ orderId: order.id, attachments: ["res_mock_receipt_photo"] });
  };

  const handleCreateRefund = () => {
    const reason = window.prompt("Lý do yêu cầu hoàn tiền?");
    if (!reason?.trim()) return;
    
    createRefund.mutate({ orderId: order.id, reason: reason.trim(), attachments: [] });
  };

  // A seller has nothing to press here. Where the parcel is comes from the carrier's own
  // webhook and only staff may correct it, because that status is what decides whether the
  // buyer may still cancel and take the escrow back — one request against days of theirs.
  if (isSeller) {
    if (order.state === "open") {
      return (
        <div className="flex flex-col gap-3 mt-6 border-t border-outline-variant pt-6">
          <h4 className="font-label-md text-on-surface">Thao tác của Người Bán</h4>
          <p className="text-body-sm text-on-surface-variant">
            Trạng thái vận chuyển do đơn vị giao hàng cập nhật. Nếu bạn thấy sai, hãy báo để
            ShopNexus kiểm tra.
          </p>
          <Link
            href={`/support?kind=order-issue&ref_id=${order.id}`}
            className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant text-label-lg font-bold text-center hover:bg-surface-container transition-colors"
          >
            Báo vấn đề vận chuyển
          </Link>
        </div>
      );
    }
  }

  if (isBuyer) {
    if (order.state === "open" && order.transport?.status === "delivered") {
      return (
        <div className="flex flex-col gap-3 mt-6 border-t border-outline-variant pt-6">
          <h4 className="font-label-md text-on-surface">Thao tác của Người Mua</h4>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleConfirmReceipt}
            disabled={isBusy}
          >
            Đã nhận được hàng
          </Button>
          <Button 
            variant="outline" 
            fullWidth 
            onClick={handleCreateRefund}
            disabled={isBusy}
          >
            Yêu cầu Hoàn tiền / Trả hàng
          </Button>
        </div>
      );
    }
  }

  return null;
}
