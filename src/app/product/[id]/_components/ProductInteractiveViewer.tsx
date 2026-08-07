"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/use-auth-store";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/api/useCatalog";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import TagRail from "@/components/ui/TagRail";
import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import { formatRating } from "@/lib/reviews";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import StartChatButton from "@/components/ui/StartChatButton";
import ProductBottomBar from "./ProductBottomBar";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

/** A variant's attributes are `unknown`-valued on the wire; only the strings are selectable. */
function attributesOf(variant: Variant): Record<string, string> {
  return Object.fromEntries(
    Object.entries(variant.attributes).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;
}

export default function ProductInteractiveViewer({ product }: { product: ListingDetail }) {
  // a priced variant — and the featured one is what the card that led here showed.
  const defaultVariant = product.variants.find((v) => v.is_featured) ?? product.variants[0];

  const { user } = useAuthStore();
  const { mutate: addFavorite, isPending: isAdding } = useAddFavorite();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();
  const isPending = isAdding || isRemoving;

  const handleFavoriteClick = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm");
      return;
    }
    if (isPending) return;

    if (product.favorited) {
      removeFavorite(product.id, {
        onError: () => toast.error("Có lỗi xảy ra khi bỏ lưu sản phẩm"),
      });
    } else {
      addFavorite(product.id, {
        onError: () => toast.error("Có lỗi xảy ra khi lưu sản phẩm"),
      });
    }
  };

  const [selectedVariant, setSelectedVariant] = useState<Variant>(defaultVariant);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() =>
    attributesOf(defaultVariant),
  );

  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    product.variants.forEach((v) => {
      Object.keys(attributesOf(v)).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [product.variants]);

  const handleSelectAttribute = (key: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(newAttributes);

    const matchedVariant = product.variants.find((v) =>
      Object.entries(newAttributes).every(([k, val]) => attributesOf(v)[k] === val),
    );

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
      return;
    }

    // The combination does not exist, so the attribute just pressed wins and the rest of
    // the selection follows whatever variant carries it.
    const partialMatch = product.variants.find((v) => attributesOf(v)[key] === value);
    if (partialMatch) {
      setSelectedVariant(partialMatch);
      setSelectedAttributes(attributesOf(partialMatch));
    }
  };

  // A variant with its own photos shows them; otherwise the listing gallery is the fallback.
  const currentImages = selectedVariant.images.length > 0 ? selectedVariant.images : product.images;

  // The thumbnail is held by id and the shown image is derived, so switching variant falls
  // back to its first photo on its own — no effect mirroring the gallery into state.
  const [pickedImageId, setPickedImageId] = useState<string>("");
  const mainImage = currentImages.find((img) => img.id === pickedImageId) ?? currentImages[0];

  const { seller } = product;

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
                {currentImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setPickedImageId(img.id)}
                    className={["relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-colors", mainImage?.id === img.id ? "border-primary" : "border-transparent hover:border-outline-variant"].join(" ")}
                  >
                    <Image src={img?.url || ''} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant mt-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Link href={`/shop/${seller.id}`} className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-outline-variant">
                  {seller.avatar?.url ? (
                    <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary-container flex items-center justify-center text-lg font-bold">
                      {seller.name.charAt(0)}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${seller.id}`} className="font-title-md font-bold text-on-surface hover:text-primary transition-colors block truncate">
                    {seller.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StartChatButton sellerId={seller.id} currentPath={`/product/${product.id}`} />
                <Link href={`/shop/${seller.id}`} className="flex-1">
                  <Button variant="secondary" icon={<span className="material-symbols-outlined">storefront</span>} className="w-full">
                    Xem Shop
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl font-bold text-on-surface">
                {product.name}
              </h1>
              <button
                onClick={handleFavoriteClick}
                disabled={isPending}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-50 flex items-center justify-center border border-outline-variant/30 shadow-sm"
                aria-label={product.favorited ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm"}
              >
                <span
                  className={`material-symbols-outlined text-[24px] transition-colors ${
                    product.favorited ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                  style={{ fontVariationSettings: product.favorited ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
            </div>

            {/* The listing already carries all of this — the rating and its count, the
                completed sales, how many people saved it — and none of it was on screen.
                The rating is a link because the section it summarises is on this page. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 font-body-sm text-on-surface-variant">
              {product.review_count > 0 ? (
                <a href="#reviews" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <StarRating rating={product.rating} size={16} />
                  <span className="font-bold text-on-surface">{formatRating(product.rating)}</span>
                  <span className="underline decoration-dotted underline-offset-4">
                    {product.review_count} đánh giá
                  </span>
                </a>
              ) : (
                <a href="#reviews" className="hover:text-primary transition-colors">
                  Chưa có đánh giá
                </a>
              )}
              <span aria-hidden="true">·</span>
              <span>Đã bán {product.sold}</span>
              <span aria-hidden="true">·</span>
              <span>{product.favorite_count} lượt lưu</span>
            </div>

            <TagRail tags={product.tags} className="mb-6" />

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

            {attributeKeys.length > 0 && (
              <div className="bg-surface rounded-2xl p-6 border border-outline-variant mb-6 shadow-sm">
                <h3 className="font-headline-sm font-bold mb-4">Phân loại</h3>
                <div className="flex flex-col gap-4">
                  {attributeKeys.map((key) => {
                    const values = Array.from(
                      new Set(
                        product.variants
                          .map((v) => attributesOf(v)[key])
                          .filter((v): v is string => Boolean(v)),
                      ),
                    );
                    return (
                      <div key={key}>
                        <div className="font-label-md text-on-surface-variant mb-2 capitalize">{key}</div>
                        <div className="flex flex-wrap gap-2">
                          {values.map(val => {
                            const isSelected = selectedAttributes[key] === val;
                            // Dimmed rather than disabled: pressing an impossible combination
                            // keeps the value just chosen and moves the rest of the selection.
                            const testAttributes = { ...selectedAttributes, [key]: val };
                            const exists = product.variants.some((v) =>
                              Object.entries(testAttributes).every(
                                ([k, vAttr]) => attributesOf(v)[k] === vAttr,
                              ),
                            );

                            return (
                              <button
                                key={val}
                                type="button"
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
                {product.price_mode === "negotiable" && (
                  <Badge variant="surface" className="text-primary border-primary shrink-0 self-center">
                    Có thể thương lượng
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
                Cam kết hoàn tiền 100% nếu hàng không đúng mô tả
              </div>
            </div>

            {/* One surface for every complaint: the ticket carries the kind and the id of
                what it is about, so there is nothing here but a link that fills them in. */}
            <Link
              href={`/support?kind=report-listing&ref_id=${product.id}`}
              className="inline-flex items-center gap-1.5 mt-4 text-body-sm text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">flag</span>
              Báo cáo tin đăng này
            </Link>
          </div>
        </div>
      </div>
      
      <ProductBottomBar product={product} selectedVariant={selectedVariant} />
    </>
  );
}
