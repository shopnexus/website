"use client";

import React, { useState } from "react";
import Link from "next/link";

interface HomeProductItem {
  id: string;
  title: string;
  price: number;
  location: string;
  sellerName: string;
  sellerChar: string;
  sellerColor: string;
  image: string;
}

const INITIAL_HOME_PRODUCTS: HomeProductItem[] = [
  {
    id: "p-home-1",
    title: "Rương Gỗ Sồi Pháp 1920s Phục Chế",
    price: 4500000,
    location: "Đà Lạt",
    sellerName: "Mộc Đà Lạt",
    sellerChar: "M",
    sellerColor: "text-primary",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm5yiiT-wBdLP0J0YJNuMBC3EnzCkCfv4vtuywwk7EjBwFT4VcowMT875-mzn30V9-UGhkFQBWqJyP-SgDGCx4MJiZNTfFYf7CnLDsIn46c4nBdLYDBxpi2mQUQzDkpnrW1y9lrvfTvPPS9VmXJzKjZABU6WvqOB5o_tFVn_GzbBjlpiTij3yaPrdDDt59x7S6D4dMrnGo5ESCNf_wulWTPSlfnC8cqsXYraE84ay4i8u7xc-21z8Ru5gSIJbGj5onPwbbY0j2R9w",
  },
  {
    id: "p-home-2",
    title: "Olympus OM-1 + Lens 50mm f1.8",
    price: 3200000,
    location: "TP. Hồ Chí Minh",
    sellerName: "Phúc Camera",
    sellerChar: "P",
    sellerColor: "text-secondary",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4iqG3hlHhW1Y-5n2CBvNA30OpNAxzIjhqgoQJ39A0IMA6c3XoOplocyuXLjpoJAbdVjaA6CPPaD-tsHILfnPg5CY90zfAoixNMgSK3Fup-Na0vlQrWFsPsNRgsqI1SPKMnQyVnS7nzflUr1Vw8tv7ddcTYKJC5Vx9vMi1XCqkpciMR4SoLrY_C8WS3x7PpmfV0AxKrYRTw-fOLttDw2Mbfevq4xSI5GfG-j1i_QgvROxO8twmJvppc0DScvenBij21VMfBg611pA",
  },
  {
    id: "p-home-3",
    title: "Dây Chuyền Bạc Thủ Công Họa Tiết Cổ",
    price: 850000,
    location: "Đà Nẵng",
    sellerName: "Tiệm Bạc Xưa",
    sellerChar: "T",
    sellerColor: "text-tertiary",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDb9Y_-udrNIHkfs9Gn_f45Jp6aD7SxGsAeEulIsBIU1ibfAEwzvnaDqDMIwY9Q3oVetg6yaxRsqZlq7LOCZZPccS5QnabjVGkGVeuEN_rxBjinVCuy329dwCcYgQj6yo1wXdm4T9DczjiZUO6Fgsuzy1uHuEcSBxw-amVKSOxSxFc_pHBCdFG8u31YGuUzZWGAeGODRiC2h6G7yoPDdumqQiWpMABotJngQ49lCJaLXxwDrAZneorVoyohGDg_fzypgRODD-j0Vvk",
  },
  {
    id: "p-home-4",
    title: "Đồng Hồ Cơ Seiko 5 Vintage 1970s",
    price: 2500000,
    location: "Hà Nội",
    sellerName: "Tiệm Đồng Hồ Cũ",
    sellerChar: "Đ",
    sellerColor: "text-primary",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  },
  {
    id: "p-home-5",
    title: "Levi's 501 Vintage USA Chính Hãng",
    price: 1100000,
    location: "TP. Hồ Chí Minh",
    sellerName: "Denim Vintage",
    sellerChar: "D",
    sellerColor: "text-secondary",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxIzgT397yZpdTKCwnLOJs15-67DlkYtB_8NPZ9HQ6C3HznzBmEYfwVwMRAv4B8jrCfGR4yiTruGpuooxPtfgCIizXnFrE3O--aPCdlIRDOniM5-WVEJzcKi4CS7mnI2fyGLnMEz_bSYbp_XqpTndRtWdbLnPMSgkAcswNFWUT9Ifpw-joBIoVnT4dh0VOWwXsmqsNyXFpZYfKaUb1RBYJRc5S3Dm73jjFYlqvMJJ1Napidju2fray6adgj_LfPOfww5sx3gCchWs",
  },
  {
    id: "p-home-6",
    title: "Bộ Trà Sứ Trắng Tinh Khiết Phong Cách Nhật",
    price: 450000,
    location: "TP Thủ Đức",
    sellerName: "Gốm Sứ Nhà Khê",
    sellerChar: "G",
    sellerColor: "text-tertiary",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiUGQfpQPwzZ_RbThCeGGS8IWUfPO6eetMlDmGZ6DAHYrG9xy5xw6ACb_EOn91YsunzA_IJZ6i1cEpacu6iLIuby4C1cL1P1GE90S0e0inm6-3gJokYzZtXnS6ajYS6drZWH9BJ061TXmQXaA8uJ7imdAt2OOJB9pspq4rfdK1QA0Nkz-_YvBpNTo0Xz0BCg7b9pGTzZNY8-g6gaoI5BB4FucoyIhwn5-3og1dnWmWP1ntK_I-NU668tkEqickGwVz9PvssahNn_A",
  },
  {
    id: "p-home-7",
    title: "Máy ảnh Fujifilm X-E4 Kèm Lens 27mm f2.8",
    price: 18500000,
    location: "Hà Nội",
    sellerName: "Khoa Photo",
    sellerChar: "K",
    sellerColor: "text-primary",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
  },
  {
    id: "p-home-8",
    title: "Bàn phím cơ Custom Gasket Mount Switch Linear",
    price: 3200000,
    location: "TP. Hồ Chí Minh",
    sellerName: "Gear Setup",
    sellerChar: "G",
    sellerColor: "text-secondary",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80",
  },
];

function formatVND(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
}

function HomeProductCardComponent({
  product,
  isFav,
  onToggleFav,
}: {
  product: HomeProductItem;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
}) {
  const formattedPrice = formatVND(product.price);
  const targetId = product.id.startsWith("p-home-") ? product.id.replace("p-home-", "") : "1";

  return (
    <Link
      href={`/product/${targetId}`}
      className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 hover:border-primary/40 hover:shadow-md transition-all duration-300 group flex flex-col cursor-pointer"
    >
      <div className="aspect-square relative overflow-hidden bg-surface-container-low shrink-0">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={product.image}
          alt={product.title}
        />
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={onToggleFav}
            className="bg-white/90 p-2 rounded-full text-on-surface-variant shadow-md hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3 className="font-headline font-bold text-body-md mb-1 text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-5 h-5 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-[10px] font-bold ${product.sellerColor} shrink-0`}
            >
              {product.sellerChar}
            </div>
            <span className="text-label-sm text-on-surface-variant truncate">{product.sellerName}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/20 mt-auto">
          <span className="text-primary font-bold text-label-md">{formattedPrice}</span>
          <span className="flex items-center gap-1 text-[11px] text-on-surface-variant font-medium shrink-0">
            <span className="material-symbols-outlined text-[13px] text-primary">location_on</span> {product.location}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomeFeed(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"all" | "newest" | "suggested">("all");
  const [extraProducts, setExtraProducts] = useState<HomeProductItem[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFav = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLoadMore = (): void => {
    const batchIndex = Math.floor(extraProducts.length / INITIAL_HOME_PRODUCTS.length) + 1;
    const clonedBatch = INITIAL_HOME_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `${p.id}-clone-${batchIndex}-${idx}-${Date.now()}`,
    }));
    setExtraProducts((prev) => [...prev, ...clonedBatch]);
  };

  const allProducts = [...INITIAL_HOME_PRODUCTS, ...extraProducts];

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

      {/* Unified Homepage Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {allProducts.map((product) => (
          <HomeProductCardComponent
            key={product.id}
            product={product}
            isFav={!!favorites[product.id]}
            onToggleFav={(e) => toggleFav(e, product.id)}
          />
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
