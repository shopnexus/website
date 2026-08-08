"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import type { ListingDetail } from "@/api/generated/types.gen"
import { useCategories, useListing } from "@/hooks/api/useCatalog"
import { useUpdateListing } from "@/hooks/api/useSellerListings"
import { draftFrom, listingPatch } from "../_lib/editor.logic"
import type { ListingDraft } from "../types"

/**
 * The listing being edited, and the form over it.
 *
 * The form is seeded during render keyed on the listing id rather than in an effect: an
 * effect paints empty inputs first and fills them on a second pass, and keying on the
 * listing object itself would wipe whatever is typed every time the query refetches.
 */
export function useListingEditor(id: string) {
	const { data: listing, isLoading } = useListing(id)
	const { data: categories = [] } = useCategories()
	const updateListing = useUpdateListing()

	const [draft, setDraft] = useState<ListingDraft | null>(null)
	const [seededId, setSeededId] = useState<string | null>(null)

	if (listing && listing.id !== seededId) {
		setSeededId(listing.id)
		setDraft(draftFrom(listing))
	}

	const save = (loaded: ListingDetail) => {
		if (!draft) return
		const patch = listingPatch(draft, loaded)
		if (Object.keys(patch).length === 0) {
			toast("Không có thay đổi nào để lưu.")
			return
		}
		updateListing.mutate(
			{ id: loaded.id, body: patch },
			{
				onSuccess: (updated) => {
					// A 200 and a 202 carry the same body, so what happened is read off the
					// result: an edit held for moderation comes back with `pending_edit` set
					// and the public listing unchanged.
					toast.success(
						updated.pending_edit
							? "Đã gửi thay đổi đi kiểm duyệt. Bản đang bán giữ nguyên tới khi được duyệt."
							: "Đã lưu thay đổi.",
					)
				},
			},
		)
	}

	return {
		listing,
		isLoading,
		categories,
		draft,
		setDraft,
		save,
		isSaving: updateListing.isPending,
	}
}
