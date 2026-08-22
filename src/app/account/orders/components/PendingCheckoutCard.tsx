"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Button from "@/components/ui/Button"
import CancelCheckoutDialog from "@/components/orders/CancelCheckoutDialog"
import { usePaymentSession } from "@/hooks/api/useFinance"
import { rowShell } from "./rowShell"
import type { CheckoutGroup } from "@/lib/pending-checkout"
import type { Listing, ListingId } from "@/api/generated/types.gen"

const formatPrice = (price: number, currency: string) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(price)

/**
 * A checkout the buyer opened and did not finish paying.
 *
 * It looks like an order row and is not one: no order exists until the payment webhook
 * writes it, so this has no id to open, no seller to message and no status to track. The
 * one thing it has is a session that is still tenderable, which is why the whole card is a
 * link back to the gateway.
 *
 * Drawn as loudly as `CẦN BẠN` because it is the same kind of thing — work blocked on the
 * reader — and the only one here where waiting costs them the purchase.
 */
export default function PendingCheckoutCard({
	checkout,
	listingsById,
}: {
	checkout: CheckoutGroup
	listingsById: Map<ListingId, Listing>
}) {
	const [cancelling, setCancelling] = useState(false)
	// Not polled: this row is a link, not a screen waiting on an outcome, and a page of them
	// would otherwise re-ask for every abandoned checkout every two seconds.
	const { data: session } = usePaymentSession(checkout.sessionId, false)
	// The gateway page the payer left, when one is still waiting. Going there is the whole
	// point of the button — routing through the checkout screen only to press another button
	// puts a step between the buyer and the thing they came back to do.
	const gateway = session?.checkout_url

	const firstItem = checkout.items[0]
	const firstListing = firstItem ? listingsById.get(firstItem.listing_id) : undefined
	const otherCount = checkout.items.length - 1

	return (
		<article className={`group relative flex gap-4 p-4 ${rowShell({ accent: "tertiary" })}`}>
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

				<p className="text-label-md text-on-tertiary-container">
					Chưa thanh toán — đơn hàng chỉ được tạo sau khi bạn trả tiền
				</p>

				<p className="text-body-sm text-on-surface-variant">
					Mở lúc {new Date(checkout.createdAt).toLocaleString("vi-VN")}
				</p>

				<div className="flex items-center justify-end gap-3 mt-1">
					<button
						type="button"
						onClick={() => setCancelling(true)}
						className="text-label-md text-on-surface-variant hover:text-error transition-colors"
					>
						Huỷ đơn
					</button>
					{gateway ? (
						<a href={gateway}>
							<Button variant="primary" size="sm">
								Tiếp tục thanh toán
							</Button>
						</a>
					) : (
						// No attempt is waiting — nothing was tendered, or the one that was has
						// expired — so the buyer still has to pick a rail before there is a page
						// to open. Says so, rather than promising the gateway and delivering a form.
						<Link href={`/checkout?session_id=${checkout.sessionId}`}>
							<Button variant="primary" size="sm">
								Chọn cách thanh toán
							</Button>
						</Link>
					)}
				</div>
			</div>

			{/* No `onCancelled`: the list this card sits in is what the mutation invalidates,
			    so the row leaves on its own. */}
			<CancelCheckoutDialog
				sessionId={checkout.sessionId}
				open={cancelling}
				onClose={() => setCancelling(false)}
			/>
		</article>
	)
}
