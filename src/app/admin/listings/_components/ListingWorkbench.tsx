"use client"

import { useRef, useState } from "react"
import QueuePanel from "@/components/admin-config/QueuePanel"
import QueueTabs from "@/components/admin-config/QueueTabs"
import { LISTING_STATUS_VI } from "@/lib/dictionaries"
import { useAdminListings } from "@/hooks/api/useAdminModeration"
import ListingQueueRow from "./ListingQueueRow"
import ListingReviewPanel from "./ListingReviewPanel"
import type { ListingQueueTab } from "../_lib/types"

const TABS: ReadonlyArray<{ id: ListingQueueTab; label: string }> = [
	// Not a status: "awaiting a decision" spans a pending listing and a live one holding
	// an edit, and only the default answers both.
	{ id: "queue", label: "Cần duyệt" },
	{ id: "pending", label: LISTING_STATUS_VI.pending },
	{ id: "active", label: LISTING_STATUS_VI.active },
	{ id: "hidden", label: "Đã gỡ / đã ẩn" },
]

/**
 * The listing queue beside the listing being reviewed.
 *
 * Master–detail rather than a row that navigates away: a verdict is made by comparing the
 * pictures with the words, and coming back to the queue to pick the next one is the whole
 * shape of the job.
 *
 * Below `xl` there is no room for two columns, so the review stacks under the queue — and
 * a tap that loaded a review a screen and a half below the thumb looked like a tap that
 * did nothing. Selecting therefore scrolls the review into view, but only when it is
 * stacked: doing it beside the list would yank a column that is already on screen.
 */
export default function ListingWorkbench() {
	const [tab, setTab] = useState<ListingQueueTab>("queue")
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const reviewRef = useRef<HTMLDivElement>(null)

	const { listings, isLoading, totalCount, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useAdminListings(tab === "queue" ? undefined : tab)

	function select(id: string) {
		setSelectedId(id)
		if (window.matchMedia("(min-width: 1280px)").matches) return
		reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
	}

	return (
		<>
			<QueueTabs
				tabs={TABS}
				active={tab}
				onChange={(id) => {
					setTab(id)
					// The selected listing may not be in the new list at all.
					setSelectedId(null)
				}}
			/>

			<div className="grid grid-cols-1 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)] gap-5 items-start">
				<QueuePanel
					heading="Hàng đợi"
					count={totalCount}
					countNoun="tin đăng"
					isLoading={isLoading}
					isEmpty={listings.length === 0}
					emptyIcon="inventory_2"
					emptyTitle="Không có tin đăng nào trong danh sách này."
					emptyHint="Hàng đợi trống nghĩa là không người bán nào đang chờ được duyệt."
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					onLoadMore={() => void fetchNextPage()}
				>
					{listings.map((listing) => (
						<ListingQueueRow
							key={listing.id}
							listing={listing}
							selected={listing.id === selectedId}
							onSelect={select}
						/>
					))}
				</QueuePanel>

				<div
					ref={reviewRef}
					className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 xl:sticky xl:top-20 w-full scroll-mt-20"
				>
					{selectedId ? (
						<ListingReviewPanel listingId={selectedId} />
					) : (
						<div className="py-16 flex flex-col items-center text-center gap-2 px-6">
							<span className="material-symbols-outlined text-[40px] text-outline">
								rate_review
							</span>
							<p className="font-label-md text-on-surface">Chưa chọn tin đăng nào</p>
							<p className="font-body-sm text-on-surface-variant max-w-md">
								Chọn một tin đăng trong hàng đợi để xem ảnh, nội dung và ra quyết định.
							</p>
						</div>
					)}
				</div>
			</div>
		</>
	)
}
