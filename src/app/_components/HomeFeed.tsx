"use client";

import React, { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { mockListingPage } from "@/lib/mocks/catalog.mock";
import type { Listing } from "@/types/catalog.type";

export default function HomeFeed(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"all" | "newest" | "suggested">("all");
  const [extraProducts, setExtraProducts] = useState<Listing[]>([]);

  const handleLoadMore = (): void => {
    // For demo purposes, we clone the mock items to simulate pagination
    const batchIndex = Math.floor(extraProducts.length / mockListingPage.items.length) + 1;
    const clonedBatch = mockListingPage.items.map((p, idx) => ({
      ...p,
      id: `${p.id}-clone-${batchIndex}-${idx}-${Date.now()}`,
    }));
    setExtraProducts((prev) => [...prev, ...clonedBatch]);
  };

  const allProducts = [...mockListingPage.items, ...extraProducts];

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="font-headline font-bold text-headline-md text-on-surface">Dòng Khám Phá</h2>
        <div className="flex gap-4 border-b sm:border-none border-outline-variant/20 w-full sm:w-auto pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`text-label-md font-bold transition-colors cursor-pointer pb-1 sm:pb-0 ${
              activeTab === "all"
                ? "text-primary border-b-2 sm:border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("newest")}
            className={`text-label-md font-bold transition-colors cursor-pointer pb-1 sm:pb-0 ${
              activeTab === "newest"
                ? "text-primary border-b-2 sm:border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
            }`}
          >
            Vừa đăng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suggested")}
            className={`text-label-md font-bold transition-colors cursor-pointer pb-1 sm:pb-0 ${
              activeTab === "suggested"
                ? "text-primary border-b-2 sm:border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
            }`}
          >
            Đề xuất
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          type="button"
          onClick={handleLoadMore}
          className="px-12 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            add
          </span>
          <span>
            {extraProducts.length > 0
              ? `Tải thêm sản phẩm (Đã tải thêm ${extraProducts.length})`
              : "Tải thêm sản phẩm"}
          </span>
        </button>
      </div>
    </section>
  );
}
