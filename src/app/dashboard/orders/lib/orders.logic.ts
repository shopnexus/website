import { OrderFeedItem, OrderStats, RoleState } from '../types';

export function getStatsForRole(role: RoleState): OrderStats {
  if (role === 'buying') {
    return {
      stat1Value: '3',
      stat2Label: 'Chờ đánh giá',
      stat2Value: '12',
      stat3Label: 'Tổng chi tiêu',
      stat3Value: '1.240.000 ₫'
    };
  } else {
    return {
      stat1Value: '5',
      stat2Label: 'Đang đăng bán',
      stat2Value: '8',
      stat3Label: 'Chờ thanh toán',
      stat3Value: '6.420.000 ₫'
    };
  }
}

export function filterOrders(orders: OrderFeedItem[], search: string, filterStatus: string): OrderFeedItem[] {
  return orders.filter(order => {
    const matchesSearch = order.name.toLowerCase().includes(search.toLowerCase()) || 
                          order.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
}
