import Link from 'next/link';
import { ORDER_STATE_VI } from '@/lib/dictionaries';
import type { Order } from '@/types/order.type';
import { RoleState } from '../hooks/useOrdersFeed';

interface OrderFeedProps {
  orders: Order[];
  role: RoleState;
}

export default function OrderFeed({ orders, role }: OrderFeedProps) {
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
        const firstItem = order.items?.[0];
        const displayImg = 'https://picsum.photos/seed/' + order.id + '/200/200';
        const displayName = firstItem ? 'Sản phẩm ' + firstItem.sku_id + (order.items && order.items.length > 1 ? ` và ${order.items.length - 1} sp khác` : '') : 'Đơn hàng trống';
        
        const totalAmount = order.items?.reduce((s, i) => s + i.total_amount, 0) || 0;
        
        const statusColor = 
          order.state === 'completed' ? 'bg-secondary-container text-on-secondary-container' : 
          order.state === 'cancelled' ? 'bg-error-container text-on-error-container' : 
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
                  {ORDER_STATE_VI[order.state] || order.state}
                </span>
                <span className="text-xs text-on-surface-variant">Mã ĐH: {order.id}</span>
              </div>
              <h4 className="font-bold text-on-surface line-clamp-1">{displayName}</h4>
              <p className="text-sm text-on-surface-variant mb-1">
                {role === 'buying' ? 'Shop: ' : 'Người mua: '}
                <span className="font-semibold text-primary underline decoration-primary/30">
                  {role === 'buying' ? order.seller_id : 'Khách hàng'}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-lg font-bold text-on-surface">{formatPrice(totalAmount)}</span>
              <div className="flex gap-2 mt-2 md:mt-0">
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
