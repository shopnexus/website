"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useProductsData, ProductFilter } from "../_hooks/useProductsData";
import { LISTING_STATUS_VI } from "@/lib/dictionaries";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductTable() {
  const {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    products,
  } = useProductsData();
  
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="w-full">
      <section className="bg-surface-container-lowest rounded-xl p-4 mb-8 shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            type="text"
            className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 text-body-sm transition-all outline-none" 
            placeholder="Tìm kiếm sản phẩm, SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:flex-1">
          {(
            [
              { id: "all", label: "Tất cả sản phẩm" },
              { id: "active", label: "Đang bán" },
              { id: "inactive", label: "Đã ẩn" },
              { id: "out_of_stock", label: "Hết hàng" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as ProductFilter)}
              className={[
                "px-4 py-2 rounded-full border text-label-md font-semibold transition-all",
                activeFilter === filter.id 
                  ? "bg-primary text-on-primary border-primary" 
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-surface-container-high p-1 rounded-lg self-end lg:self-auto shrink-0">
          <button 
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md shadow-sm ${viewMode === "list" ? "bg-white text-primary" : "text-on-surface-variant hover:bg-white/50"}`}
          >
            <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
          </button>
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md shadow-sm ${viewMode === "grid" ? "bg-white text-primary" : "text-on-surface-variant hover:bg-white/50"}`}
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/20 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-4 opacity-50">inventory_2</span>
            <p className="font-body-md">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
                  <th className="px-6 py-4 font-headline text-label-sm uppercase tracking-wider text-on-surface-variant">Sản phẩm</th>
                  <th className="px-6 py-4 font-headline text-label-sm uppercase tracking-wider text-on-surface-variant">Trạng thái</th>
                  <th className="px-6 py-4 font-headline text-label-sm uppercase tracking-wider text-on-surface-variant">Giá</th>
                  <th className="px-6 py-4 font-headline text-label-sm uppercase tracking-wider text-on-surface-variant text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
                          {product.cover ? (
                            <Image src={product.cover.url || ''} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">Img</div>
                          )}
                        </div>
                        <div>
                          <Link href={`/product/${product.id}`} className="font-headline font-bold text-on-surface hover:text-primary transition-colors line-clamp-1 max-w-[300px]">
                            {product.name}
                          </Link>
                          <div className="text-body-sm text-on-surface-variant mt-1">ID: {product.id.split('_')[1]?.substring(0,8) || product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="surface" className={product.status === "active" ? "bg-secondary-container text-on-secondary-container border-transparent" : "bg-surface-container text-on-surface-variant border-transparent"}>
                        {LISTING_STATUS_VI[product.status] || product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all" title="Chỉnh sửa">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-full transition-all" title="Xóa">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {products.map((product) => (
              <div key={product.id} className="border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-[4/3] bg-surface-container relative">
                   {product.cover ? (
                     <Image src={product.cover.url || ''} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">No Image</div>
                   )}
                   <div className="absolute top-2 right-2">
                     <Badge variant="surface" className={product.status === "active" ? "bg-secondary-container/90 text-on-secondary-container backdrop-blur-sm border-transparent" : "bg-surface-container/90 text-on-surface-variant backdrop-blur-sm border-transparent"}>
                       {LISTING_STATUS_VI[product.status] || product.status}
                     </Badge>
                   </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <Link href={`/product/${product.id}`} className="font-headline font-bold text-on-surface hover:text-primary transition-colors line-clamp-2 mb-2">
                    {product.name}
                  </Link>
                  <div className="mt-auto pt-2 flex items-center justify-between border-t border-outline-variant/30">
                    <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                    <div className="flex gap-1">
                      <button className="p-1.5 text-on-surface-variant hover:text-primary rounded-full transition-all" title="Chỉnh sửa">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
