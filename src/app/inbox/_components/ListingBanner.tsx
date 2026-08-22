"use client"

import Image from "next/image"
import Link from "next/link"

import type { ListingDetail, Offer } from "@/api/generated/types.gen"
import Button from "@/components/ui/Button"
import { LISTING_CONDITION_VI } from "@/lib/dictionaries"
import { formatMoney } from "@/lib/money"
import { remainingLabel } from "@/lib/order-state"

import { offerForListing } from "../_lib/deal.logic"
import { listingAvailable, listingPlace, listingPrice } from "../_lib/listing.logic"

/**
 * The item this thread is about, pinned above the messages.
 *
 * It carries the standing offer as well as the asking price: in a long thread the offer
 * card scrolls away, and the terms are the one thing that must not need scrolling for.
 * The actions stay on that card, which is the only place they can be answered.
 */
export default function ListingBanner({
	listing,
	deals,
	onNegotiate,
}: {
	listing: ListingDetail
	deals: readonly Offer[] | undefined
	onNegotiate: () => void
}) {
	const offer = offerForListing(deals, listing.id)
	const left = offer ? remainingLabel(offer.expires_at) : null
	const place = listingPlace(listing)
	const available = listingAvailable(listing)

	return (
		<div className="bg-surface border-b border-outline-variant px-3 py-2 md:px-4 md:py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-sm z-10 relative">
			<Link href={`/product/${listing.slug}`} className="flex items-center gap-3 min-w-0 group">
				{listing.images?.[0]?.url ? (
					<Image
						src={listing.images[0].url}
						alt=""
						width={48}
						height={48}
						className="rounded-md object-cover shrink-0 w-11 h-11 md:w-12 md:h-12 border border-outline-variant"
					/>
				) : (
					<div className="w-11 h-11 md:w-12 md:h-12 bg-surface-container rounded-md shrink-0" />
				)}

				<div className="min-w-0 flex flex-col gap-0.5">
					<span className="truncate text-label-sm text-on-surface transition-colors group-hover:text-primary md:text-label-md">
						{listing.name}
					</span>

					<div className="flex items-baseline gap-2 min-w-0">
						<span className="text-price-sm text-on-surface md:text-price-md">
							{formatMoney(listingPrice(listing), listing.currency)}
						</span>
						{offer && (
							<span className="truncate text-label-sm text-tertiary tabular-nums">
								{offer.status === "accepted" ? "Đã chốt " : "Đề nghị "}
								{formatMoney(offer.total, offer.currency)}
								{offer.quantity > 1 && ` ×${offer.quantity}`}
								{left && ` · còn ${left}`}
							</span>
						)}
					</div>

					{/* The three questions a buyer asks before haggling, in the order they ask
					    them. Dropped on the narrowest screens, where the price is the whole job. */}
					<span className="hidden items-center gap-1.5 text-label-xs text-on-surface-variant sm:flex">
						<span>{LISTING_CONDITION_VI[listing.condition]}</span>
						{place && (
							<>
								<span aria-hidden="true">·</span>
								<span className="truncate">{place}</span>
							</>
						)}
						<span aria-hidden="true">·</span>
						<span className={available > 0 ? "" : "text-error"}>
							{available > 0 ? `Còn ${available}` : "Hết hàng"}
						</span>
					</span>
				</div>
			</Link>

			{/* One negotiation at a time: while an offer stands, the answer to it is the card
			    in the thread, not a second proposal from here. */}
			{listing.price_mode === "negotiable" && !offer && (
				<Button
					variant="outline"
					className="h-8 shrink-0 rounded-lg border-primary px-3 text-label-sm text-primary md:h-9 md:px-4 md:text-label-md"
					onClick={onNegotiate}
				>
					Thương lượng
				</Button>
			)}
		</div>
	)
}
