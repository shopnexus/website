"use client";

import React from "react";
import Link from "next/link";
import { useCategories } from "@/hooks/api/useCatalog";
import { CATEGORY_IMAGES, DEFAULT_CATEGORY_IMAGE } from "@/constants/categoryImages";
import HomeTagCloud from "./HomeTagCloud";

export default function HomeSidebar(): React.ReactElement {
  const { data: categories = [], isLoading } = useCategories();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Show 4 initially, or all if expanded
  const displayCategories = isExpanded ? categories : categories.slice(0, 4);

  return (
    <aside className="md:col-span-4 space-y-8">
      <div className="bg-surface-container-low rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline font-bold text-headline-sm">Góc Sưu Tầm</h3>
          <Link
            href="/search"
            className="text-label-sm text-primary underline decoration-2 underline-offset-4 hover:opacity-80 transition-opacity"
          >
            Xem tất cả
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary text-2xl">progress_activity</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {displayCategories.map((cat) => {
                const image = CATEGORY_IMAGES[cat.id] || DEFAULT_CATEGORY_IMAGE;
                return (
                  <Link key={cat.id} href={`/search?category=${cat.id}`} className="group cursor-pointer block">
                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-white p-1">
                      <img
                        className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
                        src={image}
                        alt={cat.name}
                      />
                    </div>
                    <p className="text-label-sm font-bold truncate text-on-surface">{cat.name}</p>
                  </Link>
                );
              })}
            </div>
            
            {categories.length > 4 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 flex items-center justify-center gap-1 text-label-sm font-bold text-primary hover:bg-primary/10 rounded-full transition-colors border border-primary/20"
              >
                <span>{isExpanded ? "Thu gọn" : "Xem thêm"}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <HomeTagCloud />
    </aside>
  );
}
