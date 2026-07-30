import { OrderFeedItem } from '../types';
import { ORDER_STATE_VI } from '@/lib/dictionaries';
import { OrderState } from '@/types/order.type';

interface OrderFeedProps {
  orders: OrderFeedItem[];
  prefixLabel: string;
}

export default function OrderFeed({ orders, prefixLabel }: OrderFeedProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant font-medium">
        Không tìm thấy đơn hàng nào.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((item) => (
        <div key={item.id} className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-4 rounded-xl hover:bg-surface-container-low transition-all duration-300 border border-transparent hover:border-outline-variant/20 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface flex-shrink-0">
            <img 
              src={item.image} 
              alt={item.imgAlt} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ${item.statusColor}`}>
                {ORDER_STATE_VI[item.status as OrderState] || item.status}
              </span>
              <span className="text-xs text-on-surface-variant">Mã ĐH: {item.id}</span>
            </div>
            <h4 className="font-bold text-on-surface">{item.name}</h4>
            <p className="text-sm text-on-surface-variant mb-1">
              {prefixLabel && <span>{prefixLabel} </span>}
              <span className="font-semibold text-primary underline decoration-primary/30">{item.role}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-lg font-bold text-on-surface">{item.price}</span>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-lg border border-outline text-xs font-bold hover:bg-surface transition-colors">
                {item.action}
              </button>
              <button className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm hover:opacity-90 transition-opacity">
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
