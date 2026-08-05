"use client";

import { useOrdersFeed } from '../hooks/useOrdersFeed';
import OrderStatsCard from './OrderStats';
import OrderFeed from './OrderFeed';
import { ORDER_STATE_VI } from '@/lib/dictionaries';
import type { OrderState } from '@/api/generated/types.gen';

const FILTERS: Array<{ id: 'all' | OrderState; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'open', label: ORDER_STATE_VI['open'] },
  { id: 'completed', label: ORDER_STATE_VI['completed'] },
  { id: 'cancelled', label: ORDER_STATE_VI['cancelled'] },
];

export default function UnifiedOrders() {
  const {
    role,
    toggleRole,
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    stats,
    orders,
    listingsById,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useOrdersFeed();

  return (
    <main className="pt-8 pb-12 px-6 max-w-[1280px] mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Quản lý Đơn hàng</h1>
          <p className="text-on-surface-variant max-w-md font-body">Quản lý toàn bộ vòng đời mua bán của bạn từ những món đồ bạn săn được đến những sản phẩm bạn trao đi.</p>
        </div>
        
        <div className="bg-surface-container-high p-1 rounded-xl flex w-full md:w-auto shadow-sm">
          <button 
            onClick={() => toggleRole('buying')}
            className={`flex md:px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              role === 'buying' 
                ? 'bg-surface-container-lowest text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đơn mua của tôi
          </button>
          <button 
            onClick={() => toggleRole('selling')}
            className={`flex-1 md:px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              role === 'selling' 
                ? 'bg-surface-container-lowest text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đơn bán của tôi
          </button>
        </div>
      </header>

      <OrderStatsCard stats={stats} />

      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">
            {FILTERS.map(filter => (
              <button 
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                  activeFilter === filter.id 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm" data-icon="search">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm đơn hàng..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all outline-none"
            />
          </div>
          
        </div>

        <OrderFeed
          orders={orders}
          listingsById={listingsById}
          role={role}
          isLoading={isLoading}
        />

        {hasNextPage && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-8 py-2.5 rounded-full border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Tải thêm đơn hàng'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
