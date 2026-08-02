import { useState, useEffect, useMemo } from 'react';
import { OrderService } from '@/services/order.service';

export type RoleState = 'buying' | 'selling';

export function useOrdersFeed() {
  const [role, setRole] = useState<RoleState>('buying');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // Map UI filter state to API state if needed, or fetch all and filter client side
        const res = await OrderService.getOrders(role === 'buying' ? 'buyer' : 'seller', activeFilter === 'all' ? undefined : activeFilter);
        setRawData(res.data || []);
      } catch (error) {
        setRawData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [role, activeFilter]); // Re-fetch when role or filter changes (or can fetch all and filter in memory)

  const stats = useMemo(() => {
    if (role === 'buying') {
      return {
        stat1Value: rawData.filter(o => o.state === 'open').length,
        stat2Label: 'Chờ đánh giá',
        stat2Value: rawData.filter(o => o.state === 'completed').length,
        stat3Label: 'Tổng chi tiêu',
        stat3Value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
          rawData.reduce((acc, order) => acc + (order.total || 0), 0)
        )
      };
    } else {
      return {
        stat1Value: rawData.filter(o => o.state === 'open').length,
        stat2Label: 'Đang giao',
        stat2Value: rawData.filter(o => o.state === 'completed').length,
        stat3Label: 'Doanh thu',
        stat3Value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
          rawData.reduce((acc, order) => acc + (order.total || 0), 0)
        )
      };
    }
  }, [rawData, role]);

  const filteredOrders = useMemo(() => {
    return rawData.filter(order => {
      const idMatch = order.id.toLowerCase().includes(search.toLowerCase());
      const nameMatch = order.items?.some((i: any) => i.snapshot?.name?.toLowerCase().includes(search.toLowerCase())) || false;
      return idMatch || nameMatch;
    });
  }, [rawData, search]);

  const toggleRole = (newRole: RoleState) => {
    setRole(newRole);
    setSearch('');
    setActiveFilter('all');
  };

  return {
    role,
    toggleRole,
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    stats,
    orders: filteredOrders,
    isLoading
  };
}
