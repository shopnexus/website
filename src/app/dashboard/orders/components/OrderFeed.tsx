'use client';

import Link from 'next/link';
import { ORDER_STATE_VI } from '@/lib/dictionaries';
import type { Listing, ListingId, Order, OrderId } from '@/api/generated/types.gen';
import { RoleState } from '../hooks/useOrdersFeed';
import { useConfirmOrder, useDeclineOrder, useAdvanceShipment } from '@/hooks/api/useOrders';

interface OrderFeedProps {
  orders: Order[];
  /** Listings behind the order lines, resolved by useOrdersFeed. */
  listingsById: Map<ListingId, Listing>;
  role: RoleState;
  isLoading?: boolean;
}

export default function OrderFeed({ orders, listingsById, role, isLoading }: OrderFeedProps) {
  if (isLoading) {
    return <div className="text-center py-12 text-on-surface-variant font-medium">Đang tải đơn hàng...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant font-medium">
        Không tìm thấy đơn hàng nào.
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        // An order line carries only listing_id; the listing itself is resolved in bulk
        // by the hook, and may still be loading or — for a deleted listing — absent.
        const firstItem = order.items?.[0];
        const firstListing = firstItem ? listingsById.get(firstItem.listing_id) : undefined;
        const otherCount = (order.items?.length ?? 0) - 1;

        const displayImg =
          firstListing?.cover?.url ?? `https://picsum.photos/seed/${order.id}/200/200`;
        const displayName = firstItem
          ? (firstListing?.name ?? 'Sản phẩm') + (otherCount > 0 ? ` và ${otherCount} sp khác` : '')
          : 'Đơn hàng';

        const totalAmount = order.total;

        const statusColor =
          order.state === 'completed' ? 'bg-secondary-container text-on-secondary-container' :
          order.state === 'cancelled' ? 'bg-error-container text-on-error-container' :
          order.state === 'awaiting-confirmation' ? 'bg-tertiary-container text-on-tertiary-container' :
          'bg-primary/10 text-primary';

        return (
          <div key={order.id} className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-4 rounded-xl hover:bg-surface-container-low transition-all duration-300 border border-transparent hover:border-outline-variant/20 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface flex-shrink-0">
              <img 
                src={displayImg} 
                alt="Product thumbnail" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ${statusColor}`}>
                  {ORDER_STATE_VI[order.state as keyof typeof ORDER_STATE_VI] || order.state}
                </span>
                <span className="text-xs text-on-surface-variant">Mã ĐH: {order.id}</span>
              </div>
              <h4 className="font-bold text-on-surface line-clamp-1">{displayName}</h4>
              <p className="text-sm text-on-surface-variant mb-1">
                {role === 'buying' ? 'Shop: ' : 'Người mua: '}
                <span className="font-semibold text-primary underline decoration-primary/30">
                  {role === 'buying' ? order.seller?.name || 'Ẩn danh' : order.buyer?.name || 'Khách hàng'}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-lg font-bold text-on-surface">{formatPrice(totalAmount)}</span>
              <div className="flex gap-2 mt-2 md:mt-0">
                {role === 'selling' && order.state === 'awaiting-confirmation' && (
                  <SellerAnswer orderId={order.id} />
                )}
                {role === 'selling' && order.state === 'open' && !order.transport && (
                  <SellerQuickShip orderId={order.id} />
                )}
                <Link href={`/orders/${order.id}`} className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm hover:opacity-90 transition-opacity">
                  Chi tiết
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SellerQuickShip({ orderId }: { orderId: OrderId }) {
  const advanceShipment = useAdvanceShipment();

  return (
    <button
      type="button"
      disabled={advanceShipment.isPending}
      onClick={() => advanceShipment.mutate({ orderId, status: 'picked-up' })}
      className="px-4 py-1.5 rounded-lg border border-primary text-primary bg-primary/5 text-xs font-bold hover:bg-primary/10 transition-colors disabled:opacity-50"
    >
      {advanceShipment.isPending ? 'Đang xử lý...' : 'Đã giao cho ĐVVC'}
    </button>
  );
}


/**
 * The seller's answer to a paid order: accept it, or refuse it with a reason.
 *
 * Only these two. A seller who does neither is chased by staff after 48 hours — the platform will
 * not void the sale on their behalf, and will not post the goods either — so leaving it alone is
 * not a third option that quietly resolves itself.
 */
function SellerAnswer({ orderId }: { orderId: OrderId }) {
  const confirm = useConfirmOrder();
  const decline = useDeclineOrder();
  // Failures are not rendered here: the QueryClient toasts every mutation error once, from the
  // server's own code, so a second copy beside the button would say the same thing twice.
  const busy = confirm.isPending || decline.isPending;

  return (
    <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => confirm.mutate(orderId)}
          className="px-4 py-1.5 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Xác nhận
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            // A reason is required by the contract and kept on the order, so it is asked for
            // rather than defaulted: "Đã hủy" with no cause tells the buyer nothing.
            const reason = window.prompt('Vì sao bạn từ chối đơn này?')?.trim();
            if (reason) decline.mutate({ orderId, reason });
          }}
          className="px-4 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant text-xs font-bold hover:bg-surface-container transition-colors disabled:opacity-50"
        >
          Từ chối
        </button>
    </div>  );
}
