import { useState, useMemo } from 'react';
import { RoleState } from '../types';
import { getStatsForRole, filterOrders } from '../lib/orders.logic';
import { buyingData, sellingData } from '@/lib/mocks/dashboard-orders.mock';

export function useOrdersFeed() {
  const [role, setRole] = useState<RoleState>('buying');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const stats = useMemo(() => getStatsForRole(role), [role]);
  
  const rawData = role === 'buying' ? buyingData : sellingData;
  const filteredOrders = useMemo(() => filterOrders(rawData, search, activeFilter), [rawData, search, activeFilter]);

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
