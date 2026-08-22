"use client";

import Image from "next/image";
import { formatMoney } from "@/lib/money";
import { stockNote } from "../_lib/facts";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";

/**
 * The item this conversation is about, pinned above the messages.
 *
 * A chat thread is between two people, not about one product — the same thread carries every
 * listing these two ever discuss. So the panel has to say which one is on the table, or the
 * seller reads "còn không?" with no idea what "it" is. This is the buyer's copy of that
 * statement; the seller's copy is the `listing_id` riding on every message the dock sends,
 * which the inbox turns back into a banner at their end.
 *
 * It shows the variant the reader has selected rather than the listing's headline price: they
 * are looking at the 128GB one, and the question they are about to ask is about that one.
 */
export default function ChatDockListingRef({
  product,
  variant,
}: {
  product: ListingDetail;
  variant: Variant;
}) {
  const cover = variant.images[0] ?? product.images[0];
  const stock = stockNote(variant.stock.available);

  return (
    <div className="flex items-center gap-2.5 border-b border-outline-variant bg-surface-container-low px-3 py-2">
      {cover?.url ? (
        <Image
          src={cover.url}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-lg border border-outline-variant object-cover"
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-lg bg-surface-container" />
      )}

      <div className="min-w-0">
        <p className="truncate font-label-sm text-on-surface">{product.name}</p>
        <p className="flex items-center gap-1.5 font-price-sm text-primary">
          {formatMoney(variant.price, product.currency)}
          <span className="font-label-xs text-on-surface-variant" aria-hidden="true">
            ·
          </span>
          <span
            className={[
              "font-label-xs",
              stock.scarce ? "text-error" : "text-on-surface-variant",
            ].join(" ")}
          >
            {stock.text}
          </span>
        </p>
      </div>
    </div>
  );
}
