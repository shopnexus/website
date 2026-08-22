"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import WaitingGroupHeader from "../../orders/components/WaitingGroupHeader"
import { rowShell } from "../../orders/components/rowShell"
import RefundActions from "../[id]/components/RefundActions"
import { useMe } from "@/hooks/api/useAccount"
import { useListingMap } from "@/hooks/api/useOrders"
import { useRefunds } from "@/hooks/api/useRefunds"
import { REFUND_STATUS_VI } from "@/lib/dictionaries"
import { formatMoney } from "@/lib/money"
import { remainingLabel } from "@/lib/order-state"
import { refundIsSettled, refundNeedsAction, refundSideOf, refundWaitingOn } from "@/lib/refund-actions"
import type { AccountId, Listing, ListingId, Refund } from "@/api/generated/types.gen"

/**
 * Refund cases, both the ones you raised and the ones raised against you.
 *
 * Grouped by whose move it is, the same axis the order screen uses — and here it matters
 * more, because every live status names a party and each carries a deadline that party
 * can miss. A seller's silence hands the case to staff; a buyer who never posts the goods
 * back leaves it stalled.
 *
 * A row says what the case is about and offers the moves that side still has. It used to
 * say neither: the heading was the raw order id, so a seller read a column of
 * "Đơn ord_5bd03gaprwzdy" with no idea which of their products was being disputed, and a
 * row reading "Đang chờ bạn trả lời" had nothing on it to press — the two decisions a
 * seller has existed only on the case's own page, one click further in.
 */
export default function RefundList({ role }: { role?: "buyer" | "seller" }) {
	const { data: me } = useMe()
	const { refunds, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useRefunds()

	// One read for every product named on the page, not one per row. The refund carries the
	// listing ids and catalogue resolves them — the same batching the order list uses.
	const listingIds = useMemo(() => {
		const ids = new Set<ListingId>()
		for (const refund of refunds) for (const id of refund.order.listing_ids) ids.add(id)
		return [...ids]
	}, [refunds])
	const listingsById = useListingMap(listingIds)

	const needsYou: Refund[] = []
	const waiting: Refund[] = []
	const done: Refund[] = []
	for (const refund of refunds) {
		const { isBuyer } = refundSideOf(refund, me?.id)
		// Shown inside Đơn mua / Đơn bán, so each list holds only the cases on that side of
		// the sale. Without a role it is every case the account is party to.
		if (role && isBuyer !== (role === "buyer")) continue
		if (refundIsSettled(refund.status)) done.push(refund)
		else (refundNeedsAction(refund.status, { isBuyer }) ? needsYou : waiting).push(refund)
	}

	return (
		<div>
			{isLoading ? (
				<div className="flex flex-col gap-3">
					{[0, 1].map((row) => (
						<Skeleton key={row} className="h-32 w-full rounded-2xl" />
					))}
				</div>
			) : refunds.length === 0 ? (
				<EmptyState
					icon="assignment_return"
					title="Chưa có yêu cầu hoàn tiền nào"
					description="Yêu cầu được mở từ trang chi tiết đơn hàng, sau khi kiện hàng đã rời kho — mở một đơn để xem các lựa chọn."
					action={
						role === "seller"
							? { label: "Xem đơn bán", href: "/account/sales" }
							: { label: "Xem đơn mua", href: "/account/orders" }
					}
				/>
			) : (
				<div className="flex flex-col gap-3">
					<Group title="CẦN BẠN" rows={needsYou} me={me?.id} listingsById={listingsById} highlight />
					<Group title="ĐANG CHỜ" rows={waiting} me={me?.id} listingsById={listingsById} />
					<Group
						title={`XONG (${done.length})`}
						rows={done}
						me={me?.id}
						listingsById={listingsById}
						dim
					/>

					{hasNextPage && (
						<div className="flex justify-center pt-4">
							<Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
								{isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

function Group({
	title,
	rows,
	me,
	listingsById,
	highlight = false,
	dim = false,
}: {
	title: string
	rows: Refund[]
	me: AccountId | undefined
	listingsById: Map<ListingId, Listing>
	highlight?: boolean
	dim?: boolean
}) {
	if (rows.length === 0) return null

	return (
		<section className="flex flex-col gap-3">
			<WaitingGroupHeader title={title} tone={highlight ? "primary" : "muted"} />

			{rows.map((refund) => (
				<RefundRow
					key={refund.id}
					refund={refund}
					me={me}
					listingsById={listingsById}
					highlight={highlight}
					dim={dim}
				/>
			))}
		</section>
	)
}

/**
 * One case: what was bought, what is owed, who is on the other side, and what you can do.
 *
 * An `<article>` rather than a `<Link>` around everything, because the decisions sit in it
 * — a button inside an anchor is a button that navigates. The name is the link instead,
 * which is also the part a reader aims at.
 */
function RefundRow({
	refund,
	me,
	listingsById,
	highlight,
	dim,
}: {
	refund: Refund
	me: AccountId | undefined
	listingsById: Map<ListingId, Listing>
	highlight: boolean
	dim: boolean
}) {
	const { isBuyer } = refundSideOf(refund, me)
	const left = remainingLabel(refund.deadline_at)
	const order = refund.order

	// The other party, named from the side the reader is on.
	const counterparty = isBuyer ? order.seller : order.buyer
	const first = listingsById.get(order.listing_ids[0])
	const others = order.listing_ids.length - 1

	return (
		<article
			className={`flex flex-col gap-3 p-4 ${rowShell({
				accent: highlight ? "primary" : null,
				dim,
			})}`}
		>
			<div className="flex gap-3">
				<Link
					href={`/account/refunds/${refund.id}`}
					className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container"
				>
					{first?.cover?.url ? (
						<Image src={first.cover.url} alt="" fill className="object-cover" sizes="56px" />
					) : (
						<span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[20px] text-on-surface-variant">
							inventory_2
						</span>
					)}
				</Link>

				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<div className="flex items-start justify-between gap-3">
						<Link
							href={`/account/refunds/${refund.id}`}
							className="line-clamp-1 text-title-sm text-on-surface transition-colors hover:text-primary"
						>
							{first?.name ?? "Đơn hàng"}
							{others > 0 && (
								<span className="text-body-sm text-on-surface-variant"> và {others} sản phẩm khác</span>
							)}
						</Link>
						<span className="shrink-0 text-label-sm text-on-surface-variant">
							{REFUND_STATUS_VI[refund.status]}
						</span>
					</div>

					{/* The amount at stake. A refund is always for the whole sale, so this is the
					    order's total rather than a figure of its own. */}
					<div className="flex flex-wrap items-baseline gap-x-2 text-body-sm text-on-surface-variant">
						<span className="text-price-md text-on-surface">
							{formatMoney(order.total, order.currency)}
						</span>
						<span aria-hidden="true">·</span>
						<span>
							{isBuyer ? "Người bán" : "Người mua"}: {counterparty.name}
						</span>
					</div>

					<p className={highlight ? "text-label-md text-primary" : "text-body-sm text-on-surface-variant"}>
						{refundWaitingOn(refund.status, { isBuyer })}
					</p>

					<p className="line-clamp-2 text-body-sm text-on-surface-variant">{refund.reason}</p>

					{left && !dim && <span className="text-label-sm text-error">còn {left}</span>}
				</div>
			</div>

			{/* The moves this side still has, on the row rather than a click away. Renders
			    nothing when there are none, which is what keeps a waiting case quiet. */}
			<RefundActions refund={refund} isBuyer={isBuyer} layout="row" />
		</article>
	)
}
