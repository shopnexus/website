"use client";

import React from "react";
import Link from "next/link";

export default function HomeHero(): React.ReactElement {
  return (
    <div className="space-y-12">
      <section className="relative h-[480px] rounded-2xl overflow-hidden group">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi7xKiudAWN2adGvdyN6lEEnmrrBpeY1yS-TDEIRdVxEl2qC-eavFY7YuLEiG3IYmFfhC4GJKz4knnxihfmUIpRHhUP1DJIavxqD1CwFr1FCyM2_EkKqkjWuk__AvMvWRWSjnQXyuz4uPHnXMXJshbsNu0EhvpeTMxdpxoEEr7nJZMPvuGJsqlrGdIutl0DXiaKsU740dPscDZTOfWzeeOmMugV4Od6vklrxYI__2Yf80hmZGo2VOnVdZ2CbblD6STcScuiPHpEKM"
            alt="ShopNexus Hero Banner"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-10 text-on-primary">
          <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-label-sm mb-4 uppercase tracking-widest border border-white/20">
            Kết nối thực - Giá trị thực
          </span>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl mb-4 leading-tight">
            Cùng ShopNexus Viết Tiếp Câu Chuyện Của Những Món Đồ.
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
