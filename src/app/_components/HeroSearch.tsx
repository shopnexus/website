"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserLocation } from "@/hooks/useUserLocation";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("79"); // Default to HCM code
  const { locationOptions } = useUserLocation(location, setLocation);

  return (
    <section className="bg-primary text-on-primary py-12 md:py-20 px-4">
      <div className="max-w-[800px] mx-auto text-center">
        <h1 className="text-[36px] md:text-[48px] font-bold leading-[1.15] tracking-tight mb-8 font-['Manrope']">
          Giá tốt, gần bạn, chốt nhanh!
        </h1>

        <div className="flex flex-col sm:flex-row bg-surface rounded-full p-2 mb-6 gap-2 w-full max-w-3xl mx-auto shadow-lg">
          <div className="flex-1 relative flex items-center bg-surface-container-low rounded-full px-4 text-on-surface">
            <span className="material-symbols-outlined text-on-surface-variant mr-3 shrink-0">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full py-3 bg-transparent outline-none text-body-md"
            />
          </div>
          <div className="relative flex items-center bg-surface-container-low rounded-full px-4 text-on-surface shrink-0 w-full sm:w-[180px]">
            <span className="material-symbols-outlined text-on-surface-variant mr-2">
              location_on
            </span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent outline-none text-body-md appearance-none pr-6 cursor-pointer w-full"
            >
              <option value="">Chọn khu vực</option>
              {locationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>
          <Link
            href={`/search?q=${query}&loc=${location}`}
            className="sm:px-8 shrink-0 inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 bg-on-primary text-primary px-6 py-3 text-base gap-2 hover:opacity-90"
          >
            Tìm kiếm
          </Link>
        </div>
      </div>
    </section>
  );
}
