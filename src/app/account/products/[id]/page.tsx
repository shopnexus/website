"use client";

import { use } from "react";
import Link from "next/link";
import AccountPage from "@/components/account/AccountPage";
import ListingHistory from "@/components/listings/ListingHistory";
import ListingDetailsForm from "./_components/ListingDetailsForm";
import PublicationPanel from "./_components/PublicationPanel";
import VariantsPanel from "./_components/VariantsPanel";
import { useListingEditor } from "./_hooks/useListingEditor";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { listing, isLoading, categories, draft, setDraft, save, isSaving } = useListingEditor(id);

  if (isLoading || !listing || !draft) {
    return (
      <div className="p-8 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[28px]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <AccountPage
      title={listing.name}
      description={`Đã bán ${listing.sold} · ${listing.review_count} đánh giá`}
      width="wide"
      actions={
        <>
          <Link
            href="/account/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-label-md text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_back
            </span>
            Sản phẩm của tôi
          </Link>
          <Link
            href={`/product/${listing.slug}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-outline-variant text-label-md text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Xem như người mua
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <ListingDetailsForm
            listing={listing}
            draft={draft}
            onChange={setDraft}
            onSave={() => save(listing)}
            saving={isSaving}
            categories={categories}
          />
          <VariantsPanel listing={listing} />
          <ListingHistory listingId={listing.id} viewerIsSeller />
        </div>

        <div className="lg:sticky lg:top-24">
          <PublicationPanel listing={listing} />
        </div>
      </div>
    </AccountPage>
  );
}
