"use client"

import Image from "next/image"
import { formatMoney } from "@/lib/money"
import type { Listing } from "@/api/generated/types.gen"
import { queueReason } from "../_lib/queue.logic"

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
					"w-full text-left flex gap-2.5 px-3 sm:px-4 py-2.5 border-l-[3px] transition-colors cursor-pointer",
					selected
						? "border-l-primary bg-primary/5"
						: "border-l-transparent hover:bg-surface-container-low",
				].join(" ")}
			>
				<div className="relative w-11 h-11 rounded-lg overflow-hidden bg-surface-container shrink-0">
					{listing.cover?.url ? (
						<Image src={listing.cover.url} alt="" fill className="object-cover" sizes="44px" />
					) : (
						<span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-on-surface-variant">
							image
						</span>
					)}
				</div>

				{/* Two lines. The status badge used to have a line to itself next to the reason,
				    and on the "Cần duyệt" tab it said "Chờ duyệt" on every row — the tab above
				    already said it. It moves in beside the price, which is where a row differs. */}
				<div className="flex-1 min-w-0 flex flex-col gap-0.5">
					<div className="font-label-md font-semibold text-on-surface truncate">
						{listing.name}
					</div>
					<div className="flex items-center gap-2 font-label-sm text-on-surface-variant">
						<span className="truncate">{listing.seller.name}</span>
						<span className="shrink-0 truncate">· {queueReason(listing)}</span>
						<span className="ml-auto font-mono text-[12px] tabular-nums text-on-surface shrink-0">
							{formatMoney(listing.price, listing.currency)}
						</span>
					</div>
				</div>
			</button>
		</li>
	)
}
