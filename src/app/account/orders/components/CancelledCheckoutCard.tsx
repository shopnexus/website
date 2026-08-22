"use client"

import Image from "next/image"
import type { CheckoutGroup } from "@/lib/pending-checkout"
import type { Listing, ListingId } from "@/api/generated/types.gen"
import { rowShell } from "./rowShell"

const formatPrice = (price: number, currency: string) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(price)

const formatDate = (iso: string) =>
	new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
		new Date(iso),
	)

/**
 * A checkout the buyer dropped before paying.
 *
 * It is history and carries no button: the session is closed, and buying again is a new
 * checkout from the product page rather than a resumption of this one. What it answers is
 * "cái tôi vừa huỷ đâu rồi" — a question nothing on this screen could answer before,
 * because a checkout cancelled before the money landed never becomes an order and the
 * "Đã hủy" tab reads orders.
 *
 * Drawn flat and faded, like the other finished rows: nothing here is waiting on anyone.
 */
export default function CancelledCheckoutCard({
	checkout,
	listingsById,
}: {
	checkout: CheckoutGroup
	listingsById: Map<ListingId, Listing>
}) {
	const firstItem = checkout.items[0]
	const firstListing = firstItem ? listingsById.get(firstItem.listing_id) : undefined
	const otherCount = checkout.items.length - 1
	// The lines of one checkout are cancelled together, so the first one's stamp is the
	// moment the buyer dropped it.
	const cancelledAt = firstItem?.cancelled_at

	return (
		<article className={`group relative flex gap-4 p-4 ${rowShell({ dim: true })}`}>
			<div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-surface-container border border-outline-variant">
				{firstListing?.cover?.url ? (
					<Image
						src={firstListing.cover.url}
						alt={firstListing.name}
						fill
						className="object-cover"
					/>
				) : (
					<span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-on-surface-variant text-[20px]">
						inventory_2
					</span>
				)}
			</div>

			<div className="flex-1 min-w-0 flex flex-col gap-1">
				<div className="flex items-start justify-between gap-3">
					<span className="text-title-sm text-on-surface line-clamp-1">
						{firstListing?.name ?? "Đơn hàng"}
						{otherCount > 0 && (
							<span className="text-body-sm text-on-surface-variant">
								{" "}
								và {otherCount} sản phẩm khác
							</span>
						)}
					</span>
					<span className="text-price-md text-on-surface shrink-0">
						{formatPrice(checkout.total, checkout.currency)}
					</span>
				</div>

				<p className="text-body-sm text-on-surface-variant">
					Đã huỷ khi chưa thanh toán — không có khoản nào được thu
				</p>

				<p className="text-body-sm text-on-surface-variant">
					{cancelledAt ? `Huỷ lúc ${formatDate(cancelledAt)}` : "Đã huỷ"}
					<span className="text-outline"> · </span>
					<span className="tabular-nums">{checkout.sessionId}</span>
				</p>
			</div>
		</article>
	)
}
