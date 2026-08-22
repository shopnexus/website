import Link from "next/link";
import Button from "@/components/ui/Button";
import { listingDownNote } from "@/lib/listing-state";
import type { ListingDetail } from "@/api/generated/types.gen";

/**
 * What a stranger sees at the URL of a listing that is no longer live.
 *
 * A page rather than a 404, because the link is still meaningful: it is what a cart line,
 * an order item and a shared message all point at, and "không tìm thấy" would make a buyer
 * think they had the wrong item. What it deliberately does not carry is the listing itself
 * — no photos, no description, no price — because a takedown that still publishes the
 * content it removed has removed nothing.
 */
export default function ListingUnavailable({ listing }: { listing: ListingDetail }) {
  const note = listingDownNote(listing);

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-8 py-20 min-h-screen flex flex-col items-center text-center gap-4">
      <span className="material-symbols-outlined text-[56px] text-on-surface-variant" aria-hidden="true">
        visibility_off
      </span>
      <h1 className="font-headline-md font-bold text-on-surface">{note.title}</h1>
      <p className="font-body-md text-on-surface-variant">{note.body}</p>
      <p className="font-body-sm text-on-surface-variant">
        Tin đăng: <span className="font-bold text-on-surface">{listing.name}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        <Link href={`/shop/${listing.seller.id}`}>
          <Button variant="outline">Xem gian hàng</Button>
        </Link>
        <Link href="/search">
          <Button variant="primary">Tìm sản phẩm khác</Button>
        </Link>
      </div>
    </div>
  );
}
