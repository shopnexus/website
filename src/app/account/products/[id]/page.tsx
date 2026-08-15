"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
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
        <span className="material-symbols-outlined animate-spin text-primary text-3xl">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto pb-12">
      <nav className="mb-6">
        <Link
          href="/account/products"
          className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Sản phẩm của tôi
        </Link>
      </nav>

      <header className="mb-8 flex items-start gap-5">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container relative shrink-0 border border-outline-variant/40">
          {listing.images[0] ? (
            <Image
              src={listing.images[0].url || ""}
              alt={listing.name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-on-surface-variant">
              image
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-primary tracking-tight mb-1 break-words">
            {listing.name}
          </h1>
          <p className="text-on-surface-variant font-body-sm">
            Đã bán {listing.sold} · {listing.review_count} đánh giá ·{" "}
            <Link href={`/product/${listing.slug}`} className="text-primary hover:underline">
              Xem như người mua
            </Link>
          </p>
        </div>
      </header>

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
        </div>

        <div className="lg:sticky lg:top-24">
          <PublicationPanel listing={listing} />
        </div>
      </div>
    </div>
  );
}
