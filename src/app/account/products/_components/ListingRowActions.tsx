"use client";

import Link from "next/link";
import type { Listing } from "@/api/generated/types.gen";
import { PUBLISH_HINT, canPublish, canUnpublish } from "../_lib/listing-actions";
import { useListingActions } from "../_hooks/useListingActions";

/**
 * Edit, publish/hide and delete for one listing.
 *
 * Every button here reaches an endpoint; the ones that would 409 in the current state are
 * not rendered at all (see `listing-actions`). The hook is used per row rather than
 * hoisted, so the spinner belongs to the row that was pressed instead of freezing the
 * whole table.
 */
export default function ListingRowActions({
  listing,
  compact = false,
}: {
  listing: Listing;
  compact?: boolean;
}) {
  const actions = useListingActions();
  const size = compact ? "text-[18px]" : "text-[20px]";

  return (
    <div className="flex justify-end gap-1">
      <Link
        href={`/account/products/${listing.id}`}
        title="Chỉnh sửa"
        aria-label={`Chỉnh sửa ${listing.name}`}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all"
      >
        <span className={`material-symbols-outlined ${size}`}>edit</span>
      </Link>

      {canPublish(listing.status) && (
        <button
          type="button"
          title={PUBLISH_HINT}
          aria-label={`Đăng bán ${listing.name}`}
          disabled={actions.isBusy}
          onClick={() => actions.publish(listing.id)}
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all disabled:opacity-40 cursor-pointer"
        >
          <span className={`material-symbols-outlined ${size}`}>visibility</span>
        </button>
      )}

      {canUnpublish(listing.status) && (
        <button
          type="button"
          title="Ẩn khỏi trang bán"
          aria-label={`Ẩn ${listing.name}`}
          disabled={actions.isBusy}
          onClick={() => actions.unpublish(listing.id)}
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all disabled:opacity-40 cursor-pointer"
        >
          <span className={`material-symbols-outlined ${size}`}>visibility_off</span>
        </button>
      )}

      <button
        type="button"
        title="Xóa"
        aria-label={`Xóa ${listing.name}`}
        disabled={actions.isBusy}
        onClick={() => actions.remove(listing.id, listing.name)}
        className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-full transition-all disabled:opacity-40 cursor-pointer"
      >
        <span className={`material-symbols-outlined ${size}`}>delete</span>
      </button>
    </div>
  );
}
