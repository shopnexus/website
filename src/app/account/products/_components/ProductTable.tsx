"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ListingRowActions from "./ListingRowActions";
import { useProductsData, type ProductFilter } from "../_hooks/useProductsData";
import { LISTING_STATUS_VI } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/money";
import { timeAgoShort } from "@/lib/day";

const PRODUCT_FILTERS: Array<{ id: ProductFilter; label: string }> = [
  { id: "all", label: "Tất cả sản phẩm" },
  { id: "active", label: LISTING_STATUS_VI.active },
  { id: "pending", label: LISTING_STATUS_VI.pending },
  { id: "draft", label: LISTING_STATUS_VI.draft },
  { id: "hidden", label: LISTING_STATUS_VI.hidden },
];

const CARD = "rounded-2xl border border-outline-variant bg-surface-container-lowest";
// `whitespace-nowrap`: with the name column greedy, the browser was taking the width back
// out of the three fixed ones — enough that "Trạng thái" and the badge under it each broke
// across two lines. A column heading that wraps makes the row taller than any of its rows.
const HEAD_CELL =
  "whitespace-nowrap px-6 py-3 text-label-sm uppercase tracking-wider text-on-surface-variant";

export default function ProductTable() {
  const {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    products,
    totalCount,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProductsData();

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // A filtered-away list and an empty shop need different words: one is narrowed, the
  // other has nothing to narrow.
  const isNarrowed = searchQuery.trim() !== "" || activeFilter !== "all";

  return (
    <div className="w-full space-y-6">
      {/* Two rows, not one. The search box, five status filters and the view toggle were
          sharing a single wrapping row, so "Đã ẩn" broke onto a line of its own at every
          width — a second row anyway, just a ragged one. */}
      <section className={`${CARD} p-4 md:p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text"
            className="w-full bg-surface-container-low border-none rounded-lg py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 text-body-sm transition-all outline-none"
            placeholder="Tìm kiếm sản phẩm, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {totalCount !== null && (
          <p className="font-body-sm text-on-surface-variant sm:mr-auto">
            {totalCount} sản phẩm
          </p>
        )}

        <div className="flex gap-1 bg-surface-container-high p-1 rounded-lg self-end sm:self-auto shrink-0">
          <button
            onClick={() => setViewMode("list")}
            aria-label="Xem dạng danh sách"
            className={`p-1.5 rounded-md shadow-sm ${viewMode === "list" ? "bg-white text-primary" : "text-on-surface-variant hover:bg-white/50"}`}
          >
            <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Xem dạng lưới"
            className={`p-1.5 rounded-md shadow-sm ${viewMode === "grid" ? "bg-white text-primary" : "text-on-surface-variant hover:bg-white/50"}`}
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </button>
        </div>
        </div>

        {/* One tab per ListingStatus, plus "all". Each maps to a `status` the server
            actually accepts; nothing here is filtered in memory. */}
        <div className="hide-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1">
          {PRODUCT_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={[
                "shrink-0 rounded-full border px-3.5 py-1.5 text-label-md transition-all",
                activeFilter === filter.id
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className={`${CARD} p-12 text-center text-on-surface-variant`}>
          <span className="material-symbols-outlined animate-spin text-primary text-[28px]">progress_activity</span>
        </div>
      ) : products.length === 0 ? (
        isNarrowed ? (
          <EmptyState
            icon="search_off"
            title="Không có sản phẩm nào khớp"
            description="Không có tin đăng nào ứng với từ khóa và trạng thái bạn đang chọn. Thử xóa từ khóa hoặc chuyển về “Tất cả sản phẩm”."
          />
        ) : (
          <EmptyState
            icon="storefront"
            title="Bạn chưa có sản phẩm nào"
            description="Kho hàng của bạn đang trống. Đăng tin đầu tiên để người mua tìm thấy và đặt hàng."
            action={{ label: "Đăng sản phẩm mới", href: "/sell" }}
          />
        )
      ) : (
        <section className={`${CARD} overflow-hidden`}>
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                    {/* The name column takes whatever the other three do not: `w-full` here
                        against `w-px` there is the CSS idiom for "this one is greedy, those
                        shrink to fit". Without it the browser divided the row four ways and the
                        name — the only cell whose content varies — was the one that ran out. */}
                    <th className={`${HEAD_CELL} w-full`}>Sản phẩm</th>
                    <th className={`${HEAD_CELL} w-px`}>Trạng thái</th>
                    <th className={`${HEAD_CELL} w-px`}>Giá</th>
                    <th className={`${HEAD_CELL} w-px text-right`}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
                            {product.cover ? (
                              <Image src={product.cover.url || ''} alt={product.name} fill className="object-cover" sizes="48px" />
                            ) : (
                              <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-on-surface-variant text-[20px]">image</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/product/${product.slug}`} className="block truncate text-title-sm text-on-surface hover:text-primary transition-colors">
                              {product.name}
                            </Link>
                            {/* This line used to read "ID: 11ectbrc" — the listing's id with its
                                prefix stripped and the rest cut to eight characters, which
                                identifies nothing: it cannot be searched, quoted to support or
                                pasted anywhere. What a seller checks a row for is whether it has
                                sold and how long it has been up. */}
                            <p className="mt-0.5 truncate text-body-xs text-on-surface-variant">
                              {product.sold > 0 && <>Đã bán {product.sold} · </>}
                              Đăng {timeAgoShort(product.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <Badge variant="surface" className={product.status === "active" ? "bg-secondary-container text-on-secondary-container border-transparent" : "bg-surface-container text-on-surface-variant border-transparent"}>
                          {LISTING_STATUS_VI[product.status] || product.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-price-md text-on-surface">
                        {formatMoney(product.price, product.currency)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        <ListingRowActions listing={product} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-5 md:p-6">
              {products.map((product) => (
                <div key={product.id} className="border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                  <div className="aspect-[4/3] bg-surface-container relative">
                     {product.cover ? (
                       <Image src={product.cover.url || ''} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                     ) : (
                       <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-on-surface-variant text-[28px]">image</span>
                     )}
                     <div className="absolute top-2 right-2">
                       <Badge variant="surface" className={product.status === "active" ? "bg-secondary-container/90 text-on-secondary-container backdrop-blur-sm border-transparent" : "bg-surface-container/90 text-on-surface-variant backdrop-blur-sm border-transparent"}>
                         {LISTING_STATUS_VI[product.status] || product.status}
                       </Badge>
                     </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/product/${product.slug}`} className="text-title-md text-on-surface hover:text-primary transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </Link>
                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-outline-variant">
                      <span className="text-price-md text-primary">{formatMoney(product.price, product.currency)}</span>
                      <ListingRowActions listing={product} compact />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="p-6 flex justify-center border-t border-outline-variant">
              <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
