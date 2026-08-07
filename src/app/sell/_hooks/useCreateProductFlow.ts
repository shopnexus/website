"use client"

import { useState } from "react"
import type { ContactId, CreateListingRequest, ListingId } from "@/api/generated/types.gen"
import { useCreateListing, usePublishListing } from "@/hooks/api/useCatalog"

export interface PublishResult {
	listingId: ListingId
	published: boolean
}

export function useCreateProductFlow() {
	const createListing = useCreateListing()
	const publishListing = usePublishListing()
	const [draftId, setDraftId] = useState<ListingId | null>(null)

	async function ensureDraft(payload: CreateListingRequest): Promise<ListingId> {
		if (draftId) return draftId
		const listing = await createListing.mutateAsync(payload)
		setDraftId(listing.id)
		return listing.id
	}

	async function saveDraft(payload: CreateListingRequest): Promise<ListingId> {
		return ensureDraft(payload)
	}

	async function submitForReview(
		payload: CreateListingRequest,
		pickupContactId: ContactId | "",
	): Promise<PublishResult> {
		const listingId = await ensureDraft(payload)
		try {
			await publishListing.mutateAsync({
				id: listingId,
				body: pickupContactId ? { pickup_contact_id: pickupContactId } : undefined,
			})
			return { listingId, published: true }
		} catch {
			return { listingId, published: false }
		}
	}

	return {
		draftId,
		saveDraft,
		submitForReview,
		isCreating: createListing.isPending,
		isPublishing: publishListing.isPending,
		isPending: createListing.isPending || publishListing.isPending,
	}
}
