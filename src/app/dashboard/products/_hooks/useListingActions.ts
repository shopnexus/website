"use client"

import { toast } from "react-hot-toast"
import type { ListingId } from "@/api/generated/types.gen"
import { usePublishListing } from "@/hooks/api/useCatalog"
import { useDeleteListing, useUnpublishListing } from "@/hooks/api/useSellerListings"

/**
 * The three things a seller does to a whole listing from a list row.
 *
 * Grouped in one hook because a row renders all three and each needs its own pending
 * flag; the confirmations live here rather than in the JSX so a button handler stays one
 * call. Failures are not caught: the query client's mutation cache already turns a coded
 * error into the right Vietnamese sentence, and a second toast here would show two.
 */
export function useListingActions() {
	const publish = usePublishListing()
	const unpublish = useUnpublishListing()
	const remove = useDeleteListing()

	return {
		isBusy: publish.isPending || unpublish.isPending || remove.isPending,

		/**
		 * Send it for moderation. No `pickup_contact_id`, so the server takes the seller's
		 * default pickup address — the place to choose a different one is the editor, where
		 * the whole listing is in front of them.
		 */
		publish: (id: ListingId) => {
			publish.mutate(
				{ id },
				{ onSuccess: () => toast.success("Đã gửi sản phẩm đi kiểm duyệt.") },
			)
		},

		unpublish: (id: ListingId) => {
			if (!confirm("Ẩn sản phẩm này khỏi trang bán? Bạn có thể đăng lại bất cứ lúc nào.")) return
			unpublish.mutate(id, { onSuccess: () => toast.success("Đã ẩn sản phẩm.") })
		},

		remove: (id: ListingId, name: string) => {
			if (!confirm(`Xóa “${name}”? Đơn hàng cũ vẫn giữ được thông tin sản phẩm này.`)) return
			remove.mutate(id, { onSuccess: () => toast.success("Đã xóa sản phẩm.") })
		},
	}
}
