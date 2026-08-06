"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { Order, TransportCheckpoint } from "@/api/generated/types.gen";
import { 
  useAdvanceShipment, 
  useConfirmReceipt, 
  useCreateRefund,
  useCancelOrder
} from "@/hooks/api/useOrders";
import { useMe } from "@/hooks/api/useAccount";

interface OrderActionsProps {
  order: Order;
}

const TRANSPORT_FLOW: TransportCheckpoint[] = ['picked-up', 'in-transit', 'delivered'];

export default function OrderActions({ order }: OrderActionsProps) {
  const { data: me } = useMe();
  const advanceShipment = useAdvanceShipment();
  const confirmReceipt = useConfirmReceipt();
  const createRefund = useCreateRefund();
  const cancelOrder = useCancelOrder();
  
  const [isUploading, setIsUploading] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  if (!me) return null;

  const isSeller = me.id === order.seller.id;
  const isBuyer = me.id === order.buyer.id;
  
  const isBusy = advanceShipment.isPending || confirmReceipt.isPending || createRefund.isPending || cancelOrder.isPending || isUploading;

  const handleAdvanceShipment = (nextStatus: TransportCheckpoint) => {
    advanceShipment.mutate({ orderId: order.id, status: nextStatus });
  };

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

  if (isSeller) {
    if (order.state === "open") {
      // Determine next transport status
      let nextStatus: TransportCheckpoint = 'picked-up';
      if (order.transport) {
        const currentIdx = TRANSPORT_FLOW.indexOf(order.transport.status as TransportCheckpoint);
        if (currentIdx >= 0 && currentIdx < TRANSPORT_FLOW.length - 1) {
          nextStatus = TRANSPORT_FLOW[currentIdx + 1];
        } else if (order.transport.status === 'delivered' || order.transport.status === 'failed' || order.transport.status === 'returned') {
          return null; // Terminal state for shipment progression
        }
      }

      const statusLabel = {
        'picked-up': 'Đã lấy hàng',
        'in-transit': 'Đang giao hàng',
        'delivered': 'Đã giao thành công'
      }[nextStatus] || 'Cập nhật trạng thái';

      return (
        <div className="flex flex-col gap-3 mt-6 border-t border-outline-variant pt-6">
          <h4 className="font-label-md text-on-surface">Thao tác của Người Bán</h4>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={() => handleAdvanceShipment(nextStatus)}
            disabled={isBusy}
          >
            {isBusy ? "Đang xử lý..." : `Cập nhật: ${statusLabel}`}
          </Button>
          {!order.transport && (
             <p className="text-body-sm text-on-surface-variant text-center mt-2">
               Hãy giao hàng cho ĐVVC và bấm "Đã lấy hàng"
             </p>
          )}
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
