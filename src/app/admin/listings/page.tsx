"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import Tabs from "@/components/ui/Tabs"
import { LISTING_STATUS_VI } from "@/lib/dictionaries"
import { useAdminListings } from "@/hooks/api/useAdminModeration"
import ListingQueueRow from "./_components/ListingQueueRow"
import ListingReviewPanel from "./_components/ListingReviewPanel"
import type { ListingQueueTab } from "./_lib/types"

const TABS: Array<{ id: ListingQueueTab; label: string }> = [
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
 */
export default function AdminListingsPage() {
	const [tab, setTab] = useState<ListingQueueTab>("queue")
	const [selectedId, setSelectedId] = useState<string | null>(null)

	const { listings, isLoading, totalCount, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useAdminListings(tab === "queue" ? undefined : tab)

	return (
		<div className="p-6 lg:p-8 flex flex-col gap-6">
			<header className="flex flex-col gap-1">
				<h1 className="font-headline-md font-bold text-on-surface">Kiểm duyệt tin đăng</h1>
				<p className="font-body-sm text-on-surface-variant">
					Tin chờ xuất bản lần đầu và tin đang bán có chỉnh sửa chờ duyệt, cũ nhất lên trước.
				</p>
			</header>

			<div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
				<Tabs
					tabs={TABS}
					activeTabId={tab}
					onChange={(id) => {
						setTab(id as ListingQueueTab)
						// The selected listing may not be in the new list at all.
						setSelectedId(null)
					}}
					fullWidth
				/>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-5 items-start">
				<div className="flex flex-col gap-2.5">
					{totalCount !== null && (
						<span className="font-label-sm text-on-surface-variant px-1">
							{totalCount} tin đăng
						</span>
					)}

					{isLoading &&
						[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[88px] w-full rounded-2xl" />)}

					{!isLoading && listings.length === 0 && (
						<div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 flex flex-col items-center gap-2 text-center">
							<span className="material-symbols-outlined text-[32px] text-on-surface-variant">
								inventory_2
							</span>
							<p className="font-body-sm text-on-surface-variant">
								Không có tin đăng nào trong danh sách này.
							</p>
						</div>
					)}

					{listings.map((listing) => (
						<ListingQueueRow
							key={listing.id}
							listing={listing}
							selected={listing.id === selectedId}
							onSelect={setSelectedId}
						/>
					))}

					{hasNextPage && (
						<Button
							variant="outline"
							fullWidth
							disabled={isFetchingNextPage}
							onClick={() => fetchNextPage()}
						>
							{isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
						</Button>
					)}
				</div>

				<div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 xl:sticky xl:top-6">
					{selectedId ? (
						<ListingReviewPanel listingId={selectedId} />
					) : (
						<div className="py-16 flex flex-col items-center gap-2 text-center">
							<span className="material-symbols-outlined text-[32px] text-on-surface-variant">
								rate_review
							</span>
							<p className="font-body-sm text-on-surface-variant">
								Chọn một tin đăng bên trái để xem nội dung và ra quyết định.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
