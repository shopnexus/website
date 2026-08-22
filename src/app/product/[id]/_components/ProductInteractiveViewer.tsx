"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import OfferModal from "@/components/offers/OfferModal";
import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import type { SellerStanding } from "../_lib/context";
import { listingFacts, packageEntries, specificationEntries } from "../_lib/facts";
import { usePurchaseActions } from "../_hooks/usePurchaseActions";
import { useScrolledPast } from "../_hooks/useScrolledPast";
import BuyPanel from "./BuyPanel";
import DescriptionPanel from "./DescriptionPanel";
import ProductChatDock from "./ProductChatDock";
import ProductHeadline from "./ProductHeadline";
import QuickFacts from "./QuickFacts";
import ProductBottomBar from "./ProductBottomBar";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import SectionNav from "./SectionNav";
import SellerCard from "./SellerCard";
import SpecTable from "./SpecTable";
import { attributesOf } from "./VariantPicker";

/**
 * The product page, around the one thing every part of it depends on: which variant is chosen.
 *
 * The gallery, the price, the stock line, the shipping weights and both sets of buy buttons
 * are all functions of that choice, so it is held once here and read everywhere rather than
 * mirrored into each panel.
 *
 * The layout is three columns on a wide screen: photos, what the thing is, and the offer.
 * It was two, and the second was 640px of a 1200px page holding a card whose content was
 * about 350px wide — so the buy buttons stretched to a quarter of the screen each, the seller
 * band under it ran the full width to say "Người bán mới", and the whole page came to 6,400px
 * tall. Splitting the right half in two gives the controls the width controls should have and
 * lets the offer stick while the reader scrolls the description.
 *
 * The four blocks are placed by hand rather than nested in column wrappers, because their
 * reading order on a phone interleaves the columns: name, then price, then the details. Three
 * wrappers would have forced either the price above the name or the specifications above the
 * price. Source order is the phone order; `col-start`/`row-start` is the desktop arrangement.
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
  const buyPanelGone = useScrolledPast(buyPanel);
  /** Opened by the dock's own button, and by "Chat" on the seller card. */
  const [chatOpen, setChatOpen] = useState(false);

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
      <div className="mx-auto max-w-[1320px] px-4 pb-14 md:px-8">
        <div
          className={[
            "flex flex-col gap-5",
            "lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-x-7 lg:gap-y-6",
            "xl:grid-cols-[424px_minmax(0,1fr)_336px] xl:gap-x-8",
          ].join(" ")}
        >
          <div className="lg:col-start-1 lg:row-start-1 lg:row-span-3">
            <ProductGallery
              images={images}
              alt={product.name}
              badge={<Badge variant="glass">{condition}</Badge>}
            />
          </div>

          <div className="lg:col-start-2 lg:row-start-1 xl:col-start-2">
            <ProductHeadline product={product} actions={actions} />
          </div>

          {/* Sticky only where it has a column to itself. Below `xl` it is a card in the flow
              and the bottom bar is what follows the reader down. */}
          <div
            ref={buyPanel}
            className="flex flex-col gap-4 lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1 xl:row-span-3 xl:sticky xl:top-[84px]"
          >
            <BuyPanel
              product={product}
              selectedVariant={selectedVariant}
              selectedAttributes={selectedAttributes}
              onSelectAttribute={handleSelectAttribute}
              actions={actions}
            />
            <SellerCard
              product={product}
              standing={standing}
              onChat={() => setChatOpen(true)}
            />
          </div>

          <div className="lg:col-start-2 lg:row-start-3 xl:col-start-2 xl:row-start-2">
            <div className="rounded-2xl border border-outline-variant bg-surface p-4">
              <QuickFacts facts={listingFacts(product)} />
            </div>

            {/* One surface for every complaint: the ticket carries the kind and the id of what
                it is about, so there is nothing here but a link that fills them in. */}
            <Link
              href={`/inbox?kind=report-listing&ref_id=${product.id}`}
              className="mt-3 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition-colors hover:text-error"
            >
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
                flag
              </span>
              Báo cáo tin đăng này
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <SectionNav
            sections={[
              { id: "description", label: "Mô tả" },
              ...(hasSpecs ? [{ id: "specifications", label: "Thông số" }] : []),
              { id: "reviews", label: "Đánh giá", count: product.review_count },
            ]}
          />

          <div className="flex flex-col gap-10">
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
        visible={buyPanelGone}
      />

      <ProductChatDock
        product={product}
        variant={selectedVariant}
        open={chatOpen}
        onOpenChange={setChatOpen}
        liftedForBottomBar={buyPanelGone}
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
