"use client";

import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import AccountPage from "@/components/account/AccountPage";
import ListingHistory from "@/components/listings/ListingHistory";
import ListingActionBar from "./_components/ListingActionBar";
import ListingDetailsForm from "./_components/ListingDetailsForm";
import PublicationPanel from "./_components/PublicationPanel";
import VariantsPanel from "./_components/VariantsPanel";
import { useContacts } from "@/hooks/api/useContacts";
import { useListingEditor } from "./_hooks/useListingEditor";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    listing,
    isLoading,
    categories,
    draft,
    setDraft,
    submit,
    unpublish,
    isDirty,
    isSaving,
    isUnpublishing,
  } = useListingEditor(id);
  const { data: contacts = [] } = useContacts();
  const [pickupID, setPickupID] = useState("");
  // The default pickup address is what the server would pick anyway, so the selector starts
  // there rather than on nothing — a select with no selection reads as a field to fill in.
  const pickup =
    pickupID || contacts.find((c) => c.is_default_pickup)?.id || contacts[0]?.id || "";

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
            onSubmit={() => void submit(listing, pickup)}
            categories={categories}
          />
          <VariantsPanel listing={listing} />
          <ListingHistory listingId={listing.id} viewerIsSeller />
          <ListingActionBar
            listing={listing}
            isDirty={isDirty}
            isSaving={isSaving}
            isUnpublishing={isUnpublishing}
            hasPickupAddress={contacts.length > 0}
            onSubmit={() => void submit(listing, pickup)}
            onUnpublish={() => {
              if (confirm("Ẩn sản phẩm này khỏi trang bán?")) void unpublish(listing);
            }}
          />
        </div>

        <div className="lg:sticky lg:top-24">
          <PublicationPanel
            listing={listing}
            pickupContactID={pickup}
            onPickupChange={setPickupID}
          />
        </div>
      </div>
    </AccountPage>
  );
}
