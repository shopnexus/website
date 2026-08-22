"use client"

import { useMemo } from "react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { groupByDay } from "@/lib/day"
import {
	actionLabel,
	actorName,
	detailNote,
	entryStyle,
	entryTime,
	entryTimestamp,
	fieldLabels,
	statusReached,
} from "@/lib/listing-history"
import { useListingHistory } from "@/hooks/api/useListingHistory"
import type { ListingHistoryEntry, ListingId } from "@/api/generated/types.gen"

/**
 * Everything that has happened to a listing, newest first.
 *
 * One component for both places it is read — the seller's editor and the moderator's
 * review panel — because it is one route answering both, and the server is what decides
 * how much of an entry each of them gets. `viewerIsSeller` changes only the grammar: a
 * seller reads "Bạn đã chỉnh sửa" rather than their own display name.
 *
 * Grouped by day, with the clock time on each row: a history's question is almost always
 * "what changed recently", and a column of full timestamps answers it slower than a day
 * heading does. The exact instant stays on the row's tooltip.
 */
export default function ListingHistory({
	listingId,
	viewerIsSeller = false,
}: {
	listingId: ListingId | undefined
	viewerIsSeller?: boolean
}) {
	const { entries, totalCount, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useListingHistory(listingId)

	const days = useMemo(() => groupByDay(entries, (entry) => entry.changed_at), [entries])

	return (
		<section className="rounded-2xl border border-outline-variant bg-surface-container-low overflow-hidden">
			<header className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant">
				<span className="material-symbols-outlined text-[20px] text-on-surface-variant">
					history
				</span>
				<h3 className="font-label-lg font-bold text-on-surface">Lịch sử chỉnh sửa</h3>
				{totalCount !== null && totalCount > 0 && (
					<span className="ml-auto font-label-sm text-on-surface-variant">
						{totalCount} thay đổi
					</span>
				)}
			</header>

			<div className="p-4">
				{isLoading && (
					<div className="flex flex-col gap-3">
						<Skeleton className="h-12 w-full rounded-xl" />
						<Skeleton className="h-12 w-4/5 rounded-xl" />
						<Skeleton className="h-12 w-3/5 rounded-xl" />
					</div>
				)}

				{isError && (
					<p className="font-body-sm text-on-surface-variant">
						Không tải được lịch sử của tin đăng này. Thử tải lại trang nhé.
					</p>
				)}

				{!isLoading && !isError && entries.length === 0 && (
					<p className="font-body-sm text-on-surface-variant">
						Chưa có thay đổi nào được ghi lại.
					</p>
				)}

				{days.map((day) => (
					<div key={day.key} className="mb-1 last:mb-0">
						<h4 className="font-label-sm text-on-surface-variant py-2">{day.label}</h4>
						<ol className="relative">
							{/* The spine. Drawn behind the dots and stopped short of the last one, so
							    the timeline ends at an event rather than trailing into nothing. */}
							<span
								aria-hidden
								className="absolute left-[15px] top-3 bottom-6 w-px bg-outline-variant"
							/>
							{day.items.map((entry) => (
								<HistoryRow key={entry.version} entry={entry} viewerIsSeller={viewerIsSeller} />
							))}
						</ol>
					</div>
				))}

				{hasNextPage && (
					<div className="pt-3 flex justify-center">
						<Button
							variant="ghost"
							size="sm"
							disabled={isFetchingNextPage}
							onClick={() => fetchNextPage()}
							icon={
								<span className="material-symbols-outlined text-[18px]">
									{isFetchingNextPage ? "progress_activity" : "expand_more"}
								</span>
							}
						>
							{isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
						</Button>
					</div>
				)}
			</div>
		</section>
	)
}

function HistoryRow({
	entry,
	viewerIsSeller,
}: {
	entry: ListingHistoryEntry
	viewerIsSeller: boolean
}) {
	const { icon, tone } = entryStyle(entry)
	const who = viewerIsSeller && entry.actor_kind === "seller" ? "Bạn" : actorName(entry)
	const fields = fieldLabels(entry)
	const note = detailNote(entry)
	const status = statusReached(entry)

	return (
		<li className="relative flex gap-3 pb-4 last:pb-1">
			<span
				className={`relative z-10 shrink-0 w-8 h-8 rounded-full grid place-items-center ${tone}`}
			>
				<span className="material-symbols-outlined text-[18px]">{icon}</span>
			</span>

			<div className="min-w-0 flex-1 pt-1">
				<div className="flex items-start gap-2">
					<p className="font-body-sm text-on-surface break-words flex-1">
					<span className="font-medium">{who}</span> {actionLabel(entry)}
					{/* The status the listing was left in, as a chip rather than a clause: it is the
					    one thing on the row a reader scans down the column for. */}
					{status && (
							<span className="ml-1.5 inline-flex items-center gap-0.5 align-middle rounded-full border border-outline-variant px-2 py-0.5 font-label-sm text-on-surface-variant whitespace-nowrap">
								<span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
								{status}
							</span>
						)}
					</p>

					{/* Beside the sentence rather than under it: the clock is what separates two
					    entries of the same day, and a line of its own for it doubles the height of
					    a list read by scanning. */}
					<time
						dateTime={entry.changed_at}
						title={entryTimestamp(entry.changed_at)}
						className="shrink-0 font-label-sm text-on-surface-variant pt-0.5"
					>
						{entryTime(entry.changed_at)}
					</time>
				</div>

				{fields.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mt-1.5">
						{fields.map((field) => (
							<span
								key={field}
								className="rounded-full bg-surface-container-high px-2.5 py-0.5 font-label-sm text-on-surface-variant"
							>
								{field}
							</span>
						))}
					</div>
				)}

				{note && (
					<p className="mt-1.5 rounded-xl bg-surface-container px-3 py-2 font-body-sm text-on-surface-variant break-words">
						{note}
					</p>
				)}

			</div>
		</li>
	)
}
