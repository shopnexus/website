"use client"

import Image from "next/image"
import Badge from "@/components/ui/Badge"
import { LISTING_STATUS_VI } from "@/lib/dictionaries"
import { formatMoney } from "@/lib/money"
import type { Listing } from "@/api/generated/types.gen"
import { LISTING_STATUS_STYLES, queueReason } from "../_lib/queue.logic"

/**
 * One listing waiting on a decision. Selecting it loads the full review beside the list.
 *
 * Selection is a filled background and a rail down the left edge rather than a ring drawn
 * around the row: inside a divided list a ring reads as a second, competing boundary, and
 * the rail is the same device the ticket and withdrawal queues already use to say "this
 * one".
 */
export default function ListingQueueRow({
	listing,
	selected,
	onSelect,
}: {
	listing: Listing
	selected: boolean
	onSelect: (id: string) => void
}) {
	return (
		<li>
			<button
				type="button"
				onClick={() => onSelect(listing.id)}
				aria-current={selected}
				className={[
					"w-full text-left flex gap-3 px-4 sm:px-5 py-4 border-l-4 transition-colors cursor-pointer",
					selected
						? "border-l-primary bg-primary/5"
						: "border-l-transparent hover:bg-surface-container-low",
				].join(" ")}
			>
				<div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container shrink-0">
					{listing.cover?.url ? (
						<Image src={listing.cover.url} alt="" fill className="object-cover" sizes="64px" />
					) : (
						<span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-on-surface-variant">
							image
						</span>
					)}
				</div>

				<div className="flex-1 min-w-0 flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<Badge variant="surface" className={LISTING_STATUS_STYLES[listing.status]}>
							{LISTING_STATUS_VI[listing.status]}
						</Badge>
						<span className="font-label-sm text-on-surface-variant truncate">
							{queueReason(listing)}
						</span>
					</div>
					<div className="font-body-sm font-semibold text-on-surface truncate">{listing.name}</div>
					<div className="flex items-center gap-2 font-label-sm text-on-surface-variant">
						<span className="truncate">{listing.seller.name}</span>
						<span className="ml-auto font-price-sm text-on-surface shrink-0">
							{formatMoney(listing.price, listing.currency)}
						</span>
					</div>
				</div>
			</button>
		</li>
	)
}
