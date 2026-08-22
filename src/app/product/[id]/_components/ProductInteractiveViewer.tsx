"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import OfferModal from "@/components/offers/OfferModal";
import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import { formatRating } from "@/lib/reviews";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import type { SellerStanding } from "../_lib/context";
import { listingFacts, packageEntries, specificationEntries } from "../_lib/facts";
import { usePurchaseActions } from "../_hooks/usePurchaseActions";
import BuyPanel from "./BuyPanel";
import DescriptionPanel from "./DescriptionPanel";
import QuickFacts from "./QuickFacts";
import ProductBottomBar from "./ProductBottomBar";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import SectionNav from "./SectionNav";
import SellerPanel from "./SellerPanel";
import SpecTable from "./SpecTable";
import { attributesOf } from "./VariantPicker";

/**
 * The product page, around the one thing every part of it depends on: which variant is chosen.
 *
 * The gallery, the price, the stock line, the shipping weights and both sets of buy buttons
 * are all functions of that choice, so it is held once here and read everywhere rather than
 * mirrored into each panel.
 *
 * The layout is the change worth naming. Everything that decides a purchase — the price, the
 * classification picker, how many are left, the buttons — is now the first block beside the
 * photos, with the facts a buyer weighs directly under it; the description, the specifications
 * and the reviews are full-width sections below, reachable from a sticky nav. Before this the
 * price was the *last* card in a very long right-hand column.
 */
export default function ProductInteractiveViewer({
  product,
  standing,
}: {
  product: ListingDetail;
  standing: SellerStanding;
}) {
  // The featured variant is the one the card that led here showed.
  const defaultVariant = product.variants.find((v) => v.is_featured) ?? product.variants[0];

  const [selectedVariant, setSelectedVariant] = useState<Variant>(defaultVariant);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() =>
    attributesOf(defaultVariant),
  );

  const actions = usePurchaseActions(product, selectedVariant);
  const buyPanel = useRef<HTMLDivElement>(null);

  const handleSelectAttribute = (key: string, value: string) => {
    const wanted = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(wanted);

    const matched = product.variants.find((variant) =>
      Object.entries(wanted).every(([k, v]) => attributesOf(variant)[k] === v),
    );
    if (matched) {
      setSelectedVariant(matched);
      return;
    }

    // The combination does not exist, so the attribute just pressed wins and the rest of the
    // selection follows whatever variant carries it.
    const partial = product.variants.find((variant) => attributesOf(variant)[key] === value);
    if (partial) {
      setSelectedVariant(partial);
      setSelectedAttributes(attributesOf(partial));
    }
  };

  // A variant with its own photos shows them; otherwise the listing gallery is the fallback.
  const images = selectedVariant.images.length > 0 ? selectedVariant.images : product.images;
  const condition =
    LISTING_CONDITION_VI[product.condition as keyof typeof LISTING_CONDITION_VI] ??
    product.condition;

  const specifications = specificationEntries(product);
  const packaging = packageEntries(selectedVariant);
  const hasSpecs = specifications.length > 0 || packaging.length > 0;

  return (
    <>
      <div className="mx-auto max-w-[1200px] px-4 pb-16 md:px-8">
        {/* Photos left, everything that decides a purchase right, and one surface around the
            right half rather than three stacked cards. Three bordered boxes in a column is what
            the first version of this page had, and it made a listing look like a form. */}
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-[46%] lg:max-w-[520px] lg:shrink-0">
            <ProductGallery
              images={images}
              alt={product.name}
              badge={<Badge variant="glass">{condition}</Badge>}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <header>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="font-headline-sm font-bold leading-snug text-on-surface sm:font-headline-md">
                    {product.name}
                  </h1>
                  <button
                    type="button"
                    onClick={actions.toggleFavorite}
                    disabled={actions.favoriteBusy}
                    aria-pressed={product.favorited}
                    aria-label={product.favorited ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm"}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
                  >
                    <span
                      className={[
                        "material-symbols-outlined text-[22px] transition-colors",
                        product.favorited ? "text-primary" : "text-on-surface-variant",
                      ].join(" ")}
                      style={{ fontVariationSettings: product.favorited ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-body-sm text-on-surface-variant">
                  {product.review_count > 0 ? (
                    <a
                      href="#reviews"
                      className="flex items-center gap-1.5 transition-colors hover:text-primary"
                    >
                      <StarRating rating={product.rating} size={16} />
                      <span className="font-bold text-on-surface">
                        {formatRating(product.rating)}
                      </span>
                      <span className="underline decoration-dotted underline-offset-4">
                        {product.review_count} đánh giá
                      </span>
                    </a>
                  ) : (
                    <a href="#reviews" className="transition-colors hover:text-primary">
                      Chưa có đánh giá
                    </a>
                  )}
                  {product.sold > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Đã bán {product.sold}</span>
                    </>
                  )}
                  {product.favorite_count > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{product.favorite_count} lượt lưu</span>
                    </>
                  )}
                </div>
              </header>

              <div ref={buyPanel} className="mt-5 border-t border-outline-variant pt-5">
                <BuyPanel
                  product={product}
                  selectedVariant={selectedVariant}
                  selectedAttributes={selectedAttributes}
                  onSelectAttribute={handleSelectAttribute}
                  actions={actions}
                />
              </div>

              <div className="mt-5 border-t border-outline-variant pt-5">
                <QuickFacts facts={listingFacts(product)} />
              </div>
            </div>

            {/* One surface for every complaint: the ticket carries the kind and the id of what
                it is about, so there is nothing here but a link that fills them in. */}
            <Link
              href={`/inbox?kind=report-listing&ref_id=${product.id}`}
              className="mt-3 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition-colors hover:text-error"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                flag
              </span>
              Báo cáo tin đăng này
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <SellerPanel product={product} standing={standing} />
        </div>

        <div className="mt-12">
          <SectionNav
            sections={[
              { id: "description", label: "Mô tả" },
              ...(hasSpecs ? [{ id: "specifications", label: "Thông số" }] : []),
              { id: "reviews", label: "Đánh giá", count: product.review_count },
            ]}
          />

          <div className="flex flex-col gap-12">
            <DescriptionPanel description={product.description} />
            {hasSpecs && (
              <SpecTable
                product={product}
                specifications={specifications}
                packaging={packaging}
              />
            )}
            <ProductReviews product={product} />
          </div>
        </div>
      </div>

      <ProductBottomBar
        product={product}
        selectedVariant={selectedVariant}
        actions={actions}
        anchor={buyPanel}
      />

      <OfferModal
        isOpen={actions.offerOpen}
        onClose={() => actions.setOfferOpen(false)}
        product={product}
        variant={selectedVariant}
        onSuccessCallback={actions.openNegotiationThread}
      />
    </>
  );
}
