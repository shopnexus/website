"use client"

import Image from "next/image"

import type { ListingDetail } from "@/api/generated/types.gen"
import Button from "@/components/ui/Button"
import { formatMoney } from "@/lib/money"

import { listingPrice } from "../_lib/listing.logic"

/** The item this thread is about, pinned above the messages. */
export default function ListingBanner({
	listing,
	onNegotiate,
}: {
	listing: ListingDetail
	onNegotiate: () => void
}) {
	return (
		<div className="bg-surface border-b border-outline-variant/30 p-2 md:p-3 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
			<div className="flex items-center gap-3 overflow-hidden">
				{listing.images?.[0]?.url ? (
					<Image
						src={listing.images[0].url}
						alt=""
						width={48}
						height={48}
						className="rounded object-cover shrink-0 w-10 h-10 md:w-12 md:h-12 border border-outline-variant/50"
					/>
				) : (
					<div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container rounded shrink-0" />
				)}
				<div className="min-w-0 flex flex-col">
					<span className="text-xs md:text-sm text-on-surface font-medium truncate leading-tight">
						{listing.name}
					</span>
					<span className="text-sm font-bold text-primary">
						{formatMoney(listingPrice(listing), listing.currency)}
					</span>
				</div>
			</div>

			{listing.price_mode === "negotiable" && (
				<Button
					variant="outline"
					className="shrink-0 h-8 md:h-9 px-3 md:px-4 text-[10px] md:text-xs font-bold rounded-lg border-primary text-primary ml-2"
					onClick={onNegotiate}
				>
					Thương lượng
				</Button>
			)}
		</div>
	)
}
