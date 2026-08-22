"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomeHero(): React.ReactElement {
  return (
    <div className="space-y-12">
      <section className="relative h-[480px] rounded-2xl overflow-hidden group">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-banner.jpg"
            alt="ShopNexus Hero Banner"
            fill
            priority
            quality={90}
            className="object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-10 text-on-primary">
          <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-label-sm mb-4 uppercase tracking-widest border border-white/20">
            Kết nối thực - Giá trị thực
          </span>
          <h1 className="text-display-sm md:text-display-lg mb-4">
            Cùng Viết Tiếp Câu Chuyện Của Những Món Đồ.
          </h1>
          <p className="text-body-lg text-white/90 max-w-xl mb-8">
            Nơi gặp gỡ của những tâm hồn trân trọng quá khứ và kiến tạo tương lai bền vững.
          </p>
          <Link
            href="/search"
            className="bg-white text-primary px-8 py-4 rounded-full font-bold shadow-xl hover:bg-surface-container-lowest transition-colors inline-flex items-center gap-2 group/btn cursor-pointer"
          >
            Khám phá ngay
            <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
