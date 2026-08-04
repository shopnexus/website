"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import StartChatButton from "./StartChatButton";
import ProductBottomBar from "./ProductBottomBar";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductInteractiveViewer({ product }: { product: ListingDetail }) {
  // Determine default variant
  const defaultVariant = product.variants.find((v) => v.is_featured) ?? product.variants[0];
  
  const [selectedVariant, setSelectedVariant] = useState<Variant>(defaultVariant);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    (defaultVariant.attributes as Record<string, string>) || {}
  );
  
  // Extract all attribute keys
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    product.variants.forEach(v => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach(k => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [product.variants]);

  // Handle attribute selection
  const handleSelectAttribute = (key: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(newAttributes);
    
    // Find the matching variant. If not exact match, find the first variant that matches the new attribute
    const matchedVariant = product.variants.find(v => {
      if (!v.attributes) return Object.keys(newAttributes).length === 0;
      return Object.entries(newAttributes).every(([k, val]) => v.attributes![k] === val);
    });

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    } else {
      // Fallback: if the combination doesn't exist, just select a variant that has the newly selected attribute
      const partialMatch = product.variants.find(v => v.attributes && v.attributes[key] === value);
      if (partialMatch) {
        setSelectedVariant(partialMatch);
        setSelectedAttributes((partialMatch.attributes as Record<string, string>) || {});
      }
    }
  };

  // State for main image
  const [mainImage, setMainImage] = useState(selectedVariant.images?.[0] || product.images[0]);
  
  useEffect(() => {
    if (selectedVariant.images && selectedVariant.images.length > 0) {
      setMainImage(selectedVariant.images[0]);
    } else if (product.images.length > 0) {
      setMainImage(product.images[0]);
    }
  }, [selectedVariant, product.images]);

  const { seller } = product;
  const currentImages = (selectedVariant.images && selectedVariant.images.length > 0) ? selectedVariant.images : product.images;

  return (
    <>
      <div className="max-w-[1024px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden mb-4 relative aspect-[4/5]">
              {mainImage ? (
                <Image
                  src={mainImage.url || ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-surface-container flex items-center justify-center">No Image</div>
              )}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge variant="surface">{LISTING_CONDITION_VI[product.condition as keyof typeof LISTING_CONDITION_VI] || product.condition}</Badge>
              </div>
            </div>
            
            {currentImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                {currentImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setMainImage(img)}
                    className={["relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-colors", mainImage?.id === img.id ? "border-primary" : "border-transparent hover:border-outline-variant"].join(" ")}
                  >
                    <Image src={img?.url || ''} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant mt-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <Link href={`/shop/${seller.id}`} className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-outline-variant">
                {seller.avatar?.url ? (
                  <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-secondary-container flex items-center justify-center text-lg font-bold">
                    {seller.name.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="flex-1 text-center sm:text-left">
                <Link href={`/shop/${seller.id}`} className="font-title-md font-bold text-on-surface hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-1">
                  {seller.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <StartChatButton sellerId={seller.id} currentPath={`/product/${product.id}`} />
                <Link href={`/shop/${seller.id}`} className="flex-1 sm:flex-none">
                  <Button variant="secondary" icon={<span className="material-symbols-outlined">storefront</span>} className="w-full">
                    Xem Shop
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-on-surface mb-4">
              {product.name}
            </h1>

            <div className="bg-surface rounded-2xl border border-outline-variant p-6 mb-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Mô tả</h3>
              <div className="font-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-outline-variant p-6 mb-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Chi tiết sản phẩm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-body-md">
                <div className="flex border-b border-outline-variant border-dashed pb-2">
                  <span className="text-on-surface-variant w-1/3">Tình trạng:</span>
                  <span className="text-on-surface font-medium flex-1 text-right">{LISTING_CONDITION_VI[product.condition as keyof typeof LISTING_CONDITION_VI] || product.condition}</span>
                </div>
                {Boolean(product.specifications?.brand) && (
                  <div className="flex border-b border-outline-variant border-dashed pb-2">
                    <span className="text-on-surface-variant font-label-md w-[120px]">Thương hiệu</span>
                    <span className="text-on-surface font-medium flex-1 text-right">{String(product.specifications.brand)}</span>
                  </div>
                )}
                {Boolean(product.specifications?.warranty_remaining) && (
                  <div className="flex border-b border-outline-variant border-dashed pb-2">
                    <span className="text-on-surface-variant font-label-md w-[120px]">Bảo hành</span>
                    <span className="text-on-surface font-medium flex-1 text-right">{String(product.specifications.warranty_remaining)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            {attributeKeys.length > 0 && (
              <div className="bg-surface rounded-2xl p-6 border border-outline-variant mb-6 shadow-sm">
                <h3 className="font-headline-sm font-bold mb-4">Phân loại</h3>
                <div className="flex flex-col gap-4">
                  {attributeKeys.map(key => {
                    // Extract unique values for this attribute across all variants
                    const values = Array.from(new Set(product.variants.map(v => v.attributes?.[key]).filter(Boolean) as string[]));
                    return (
                      <div key={key}>
                        <div className="font-label-md text-on-surface-variant mb-2 capitalize">{key}</div>
                        <div className="flex flex-wrap gap-2">
                          {values.map(val => {
                            const isSelected = selectedAttributes[key] === val;
                            // Check if this combination exists
                            const testAttributes = { ...selectedAttributes, [key]: val };
                            const exists = product.variants.some(v => {
                              if (!v.attributes) return false;
                              return Object.entries(testAttributes).every(([k, vAttr]) => v.attributes![k] === vAttr);
                            });
                            
                            return (
                              <button
                                key={val}
                                onClick={() => handleSelectAttribute(key, val)}
                                className={[
                                  "px-4 py-2 border rounded-xl text-body-md transition-colors",
                                  isSelected ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant hover:border-primary",
                                  !exists && !isSelected ? "opacity-50" : ""
                                ].join(" ")}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm">
              <div className="flex items-end gap-4 mb-2">
                <span className="font-display-lg text-[32px] text-primary font-bold leading-none tracking-tight">
                  {formatPrice(selectedVariant.price)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
                Cam kết hoàn tiền 100% nếu hàng không đúng mô tả
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ProductBottomBar product={product} selectedVariant={selectedVariant} />
    </>
  );
}
