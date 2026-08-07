"use client"

import Image from "next/image"
import Link from "next/link"
import OrderActions from "@/components/orders/OrderActions"
import { orderStatusLine, remainingLabel } from "@/lib/order-state"
import { waitingDeadlineAt, type WaitingSide } from "@/lib/order-waiting"
import { useNow } from "@/hooks/useNow"
import type { AccountId, Listing, ListingId, Order } from "@/api/generated/types.gen"

const formatPrice = (price: number, currency: string) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(price)

/** Under six hours the countdown turns red; above it, it is information rather than an alarm. */
const URGENT_MS = 6 * 60 * 60 * 1000

/**
 * One order.
 *
 * The card carries no role badge. Which side you are on is already in the sentence under
 * the title, and a "NGƯỜI BÁN" chip beside "Cần bạn xác nhận" says the same thing twice.
 *
 * Only a card in `CẦN BẠN` is drawn loudly — a left accent and a live countdown. That is
 * the one place boldness is spent on this screen; the other two groups are deliberately
 * flat, because a page where everything is emphasised has emphasised nothing.
 */
export default function OrderCard({
	order,
	side,
	me,
	listingsById,
}: {
	order: Order
	side: WaitingSide
	me: AccountId | undefined
	listingsById: Map<ListingId, Listing>
}) {
	// The ticking clock, passed into every time calculation below rather than read from
	// `Date.now()` mid-render: that keeps the card a pure function of its props, and is
	// what makes the countdown count down.
	const now = useNow()

	const selling = order.seller.id === me
	const counterparty = selling ? order.buyer : order.seller

	const firstItem = order.items?.[0]
	const firstListing = firstItem ? listingsById.get(firstItem.listing_id) : undefined
	const otherCount = (order.items?.length ?? 0) - 1

	const deadline = waitingDeadlineAt(order)
	const left = side === "you" ? remainingLabel(deadline, now) : null
	const urgent = deadline ? new Date(deadline).getTime() - now < URGENT_MS : false

	const needsYou = side === "you"
	const done = side === "done"

	return (
		<article
			className={[
				"group relative flex gap-4 p-4 rounded-xl border transition-colors",
				needsYou
					? "bg-surface border-outline-variant border-l-4 border-l-primary shadow-sm"
					: "bg-surface border-outline-variant/60 hover:border-outline-variant",
				done ? "opacity-70 hover:opacity-100" : "",
			].join(" ")}
		>
			<Link
				href={`/orders/${order.id}`}
				className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-surface-container border border-outline-variant/60"
			>
				{/* No placeholder service: a picsum URL made every order row fetch a random
				    photo from a third party, which reads as a product image and is not one. */}
				{firstListing?.cover?.url ? (
					<Image src={firstListing.cover.url} alt={firstListing.name} fill className="object-cover" />
				) : (
					<span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-on-surface-variant text-[20px]">
						inventory_2
					</span>
				)}
			</Link>

			<div className="flex-1 min-w-0 flex flex-col gap-1">
				<div className="flex items-start justify-between gap-3">
					<Link
						href={`/orders/${order.id}`}
						className="font-label-md font-bold text-on-surface line-clamp-1 hover:text-primary transition-colors"
					>
						{firstListing?.name ?? "Đơn hàng"}
						{otherCount > 0 && (
							<span className="font-normal text-on-surface-variant"> và {otherCount} sản phẩm khác</span>
						)}
					</Link>
					<span className="font-price-md font-bold text-on-surface shrink-0">
						{formatPrice(order.total, order.currency)}
					</span>
				</div>

				{/* The sentence, not a badge: it names the work and the other party at once. */}
				<p
					className={`text-body-sm line-clamp-2 ${needsYou ? "text-primary font-semibold" : "text-on-surface-variant"}`}
				>
					{orderStatusLine(order, { selling, now })}
				</p>

				<p className="text-body-sm text-on-surface-variant">
					{selling ? "Người mua" : "Người bán"}:{" "}
					<Link href={`/shop/${counterparty.id}`} className="hover:text-primary transition-colors">
						{counterparty.name}
					</Link>
					<span className="text-outline"> · </span>
					<span className="tabular-nums">{order.id}</span>
				</p>

				<div className="flex flex-wrap items-center justify-between gap-2 mt-1">
					{left ? (
						<span
							className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
								urgent
									? "bg-error-container text-on-error-container"
									: "bg-tertiary-container text-on-tertiary-container"
							}`}
						>
							<span className="material-symbols-outlined text-[14px]">schedule</span>
							{left === "đã quá hạn" ? left : `còn ${left}`}
						</span>
					) : (
						<span />
					)}
					<OrderActions order={order} className="justify-end" />
				</div>
			</div>
		</article>
	)
}
