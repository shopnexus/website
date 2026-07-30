import { useState, useMemo } from 'react';
import { mockOrderPage } from '@/lib/mocks/order.mock';
import { mockAccountID } from '@/lib/mocks/account.mock';
import type { Order } from '@/types/order.type';

export type RoleState = 'buying' | 'selling';

export function useOrdersFeed() {
  const [role, setRole] = useState<RoleState>('buying');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const rawData = useMemo(() => {
    if (role === 'buying') {
      return mockOrderPage.data.filter(o => o.seller_id !== mockAccountID);
    } else {
      return mockOrderPage.data.filter(o => o.seller_id === mockAccountID);
    }
  }, [role]);

  const stats = useMemo(() => {
    if (role === 'buying') {
      return {
        stat1Value: rawData.filter(o => o.state === 'open').length,
        stat2Label: 'Chờ đánh giá',
        stat2Value: rawData.filter(o => o.state === 'completed').length,
        stat3Label: 'Tổng chi tiêu',
        stat3Value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
          rawData.reduce((acc, order) => {
            const sum = order.items?.reduce((s, i) => s + i.total_amount, 0) || 0;
            return acc + sum;
          }, 0)
        )
      };
    } else {
      return {
        stat1Value: rawData.filter(o => o.state === 'open').length,
        stat2Label: 'Đang giao',
        stat2Value: rawData.filter(o => o.state === 'completed').length,
        stat3Label: 'Doanh thu',
        stat3Value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
          rawData.reduce((acc, order) => {
            const sum = order.items?.reduce((s, i) => s + i.total_amount, 0) || 0;
            return acc + sum;
          }, 0)
        )
      };
    }
  }, [rawData, role]);

  const filteredOrders = useMemo(() => {
    return rawData.filter(order => {
      const idMatch = order.id.toLowerCase().includes(search.toLowerCase());
      const nameMatch = order.items?.some(i => i.sku_id.toLowerCase().includes(search.toLowerCase())) || false;
      const matchesSearch = idMatch || nameMatch;
      const matchesStatus = activeFilter === 'all' || order.state === activeFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rawData, search, activeFilter]);

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
  };
}
