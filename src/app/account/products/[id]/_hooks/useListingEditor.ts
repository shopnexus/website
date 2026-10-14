"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import type { ContactId, ListingDetail } from "@/api/generated/types.gen"
import { useCategories, useListing, usePublishListing } from "@/hooks/api/useCatalog"
import { useUnpublishListing, useUpdateListing } from "@/hooks/api/useSellerListings"
import { draftFrom, hasChanges, listingPatch } from "../_lib/editor.logic"
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
	const publishListing = usePublishListing()
	const unpublishListing = useUnpublishListing()

	const [draft, setDraft] = useState<ListingDraft | null>(null)
	const [seededId, setSeededId] = useState<string | null>(null)

	if (listing && listing.id !== seededId) {
		setSeededId(listing.id)
		setDraft(draftFrom(listing))
	}

	/**
	 * The one thing this page does.
	 *
	 * Saving and putting the listing on sale used to be two buttons that looked the same, and
	 * on a draft they were the only two things on the screen — so a seller filled the form,
	 * pressed the one at the bottom of it, and their listing stayed unpublished. They are one
	 * action now, and what it does follows from the status: a listing that is not on sale is
	 * saved *and* sent for review, a live one keeps selling while the change is reviewed.
	 *
	 * Sequential and not parallel: publishing snapshots the listing into the moderation queue,
	 * so an edit that had not landed yet would be reviewed as the old text.
	 */
	const submit = async (loaded: ListingDetail, pickupContactID?: string) => {
		if (!draft) return
		const patch = listingPatch(draft, loaded)
		const dirty = hasChanges(draft, loaded)
		const willPublish = loaded.status === "draft" || loaded.status === "hidden"

		if (!dirty && !willPublish) {
			toast("Không có thay đổi nào để lưu.")
			return
		}
		if (dirty && Object.keys(patch).length > 0) {
			const updated = await updateListing.mutateAsync({ id: loaded.id, body: patch })
			if (!willPublish) {
				// A 200 and a 202 carry the same body, so what happened is read off the result:
				// an edit held for moderation comes back with `pending_edit` set and the public
				// listing unchanged.
				toast.success(
					updated.pending_edit
						? "Đã lưu và gửi thay đổi đi kiểm duyệt. Bản đang bán giữ nguyên tới khi được duyệt."
						: "Đã lưu thay đổi.",
				)
				return
			}
		}
		if (willPublish) {
			await publishListing.mutateAsync({
				id: loaded.id,
				body: pickupContactID ? { pickup_contact_id: pickupContactID as ContactId } : undefined,
			})
			toast.success("Đã gửi tin đăng đi kiểm duyệt. Bạn sẽ được thông báo khi có kết quả.")
		}
	}

	const unpublish = async (loaded: ListingDetail) => {
		await unpublishListing.mutateAsync(loaded.id)
		toast.success("Đã ẩn tin đăng khỏi trang bán.")
	}

	return {
		listing,
		isLoading,
		categories,
		draft,
		setDraft,
		submit,
		unpublish,
		isDirty: Boolean(listing && draft && hasChanges(draft, listing)),
		isSaving: updateListing.isPending || publishListing.isPending,
		isUnpublishing: unpublishListing.isPending,
	}
}
