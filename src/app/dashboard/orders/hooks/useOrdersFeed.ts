import { useMemo, useState } from 'react';
import { useOrderListings, useOrdersFeed as useOrdersQuery } from '@/hooks/api/useOrders';
import type { Listing, ListingId, Order, OrderState } from '@/api/generated/types.gen';

export type RoleState = 'buying' | 'selling';

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

/**
 * The dashboard order list: role and state filtered by the API, product names resolved
 * separately, text search applied in memory.
 */
export function useOrdersFeed() {
  const [role, setRole] = useState<RoleState>('buying');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | OrderState>('all');

  const { orders, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useOrdersQuery(
    role === 'buying' ? 'buyer' : 'seller',
    activeFilter === 'all' ? undefined : activeFilter,
  );

  const listingsById = useOrderListings(orders);

  const stats = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + order.total, 0);
    return {
      stat1Value: orders.filter((o) => o.state === 'open').length,
      stat2Label: role === 'buying' ? 'Chờ đánh giá' : 'Đang giao',
      stat2Value: orders.filter((o) => o.state === 'completed').length,
      stat3Label: role === 'buying' ? 'Tổng chi tiêu' : 'Doanh thu',
      stat3Value: currency.format(total),
    };
  }, [orders, role]);

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) => matchesSearch(order, needle, listingsById));
  }, [orders, search, listingsById]);

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
    /** Resolved listings, keyed by id, for rendering an order's product name and cover. */
    listingsById,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

/**
 * Search is client-side because `/orders` accepts no text parameter — sending one would
 * be ignored and quietly return the unfiltered list. It therefore only sees the orders
 * already loaded, which is the honest behaviour for a cursor-paginated stream.
 */
function matchesSearch(
  order: Order,
  needle: string,
  listingsById: Map<ListingId, Listing>,
): boolean {
  if (order.id.toLowerCase().includes(needle)) return true;
  return (order.items ?? []).some((item) =>
    listingsById.get(item.listing_id)?.name.toLowerCase().includes(needle),
  );
}
