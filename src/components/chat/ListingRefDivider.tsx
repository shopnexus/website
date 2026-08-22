"use client"

import Image from "next/image"
import Link from "next/link"

import type { Listing } from "@/api/generated/types.gen"
import { formatMoney } from "@/lib/money"

/**
 * "Hỏi về: …" — where the thread changes subject.
 *
 * Two people share one conversation for everything they ever trade, so a question sent from
 * a product page arrives in the same thread as the last three. The banner above the messages
 * names the newest listing only, which is the right answer for replying to the newest message
 * and the wrong one for reading back: without this the seller sees "còn không?" three times
 * and has to guess.
 *
 * A divider rather than a chip inside the bubble. It marks a run, not a message — everything
 * after it is about this listing until another one appears — and putting it in the bubble
 * would repeat the same card on every line of a five-message exchange.
 */
export default function ListingRefDivider({ listing }: { listing: Listing }) {
	return (
		<div className="flex justify-center" role="separator">
			<Link
				href={`/product/${listing.slug}`}
				className="group flex max-w-[85%] items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low py-1 pl-1 pr-3 transition-colors hover:border-primary"
			>
				{listing.cover?.url ? (
					<Image
						src={listing.cover.url}
						alt=""
						width={24}
						height={24}
						className="h-6 w-6 shrink-0 rounded-full object-cover"
					/>
				) : (
					<span className="h-6 w-6 shrink-0 rounded-full bg-surface-container" />
				)}
				{/* `shrink-0`: in the product page's 380px dock the flex row was squeezing the
				    label instead of the name, and "HỎI VỀ" broke across two lines inside the pill.
				    The name is the part with room to give. */}
				<span className="shrink-0 text-label-xs uppercase text-on-surface-variant">
					Hỏi về
				</span>
				<span className="truncate text-label-sm text-on-surface transition-colors group-hover:text-primary">
					{listing.name}
				</span>
				<span className="shrink-0 text-label-sm tabular-nums text-primary">
					{formatMoney(listing.price, listing.currency)}
				</span>
			</Link>
		</div>
	)
}
