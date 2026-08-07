"use client"

import { useMemo } from "react"
import { useCategories, useListing } from "@/hooks/api/useCatalog"
import type { ListingId } from "@/api/generated/types.gen"
import { pendingEditDiff } from "../_lib/queue.logic"

/**
 * The listing under review, in full.
 *
 * The queue row is a summary and carries no held edit, so the detail is read separately —
 * `GET /listings/{id}` serves a `pending` listing to staff and to its owner and to nobody
 * else, and `pending_edit` is on that read for the same reason.
 *
 * The category tree comes along because a held edit names the new category by id, and an
 * id is not something a moderator can weigh against the current one.
 */
export function useListingReview(id: ListingId | null) {
	const { data: detail, isLoading } = useListing(id ?? undefined)
	const { data: categories } = useCategories()

	const diff = useMemo(
		() => (detail ? pendingEditDiff(detail, categories ?? []) : []),
		[detail, categories],
	)

	return { detail, isLoading, diff }
}
