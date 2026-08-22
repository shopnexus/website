import { listingDownNote } from "@/lib/listing-state";
import type { ListingDetail } from "@/api/generated/types.gen";

/**
 * The state of a listing only its seller and staff can still open.
 *
 * Without it the page reads exactly as it did when it was live, which is the wrong thing to
 * show the one person who has to act on the takedown — and the reason is here because it is
 * the only place the seller is told it in full sentences.
 */
export default function ListingDownBanner({ listing }: { listing: ListingDetail }) {
  const note = listingDownNote(listing);

  return (
    <div className="max-w-[1024px] mx-auto px-4 md:px-8 pt-4">
      <div className="rounded-2xl border border-outline-variant bg-error-container text-on-error-container p-4 flex items-start gap-3">
        <span className="material-symbols-outlined shrink-0" aria-hidden="true">
          visibility_off
        </span>
        <div className="min-w-0">
          <p className="font-label-md font-bold">{note.title}</p>
          <p className="font-body-sm mt-0.5">{note.body}</p>
          <p className="font-body-sm mt-1 opacity-80">
            Người mua không mở được trang này, và tin đăng không xuất hiện trong tìm kiếm.
          </p>
        </div>
      </div>
    </div>
  );
}
