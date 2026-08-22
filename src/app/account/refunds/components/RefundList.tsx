"use client"

import Link from "next/link"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import WaitingGroupHeader from "../../orders/components/WaitingGroupHeader"
import { rowShell } from "../../orders/components/rowShell"
import { useMe } from "@/hooks/api/useAccount"
import { useRefunds } from "@/hooks/api/useRefunds"
import { REFUND_STATUS_VI } from "@/lib/dictionaries"
import { remainingLabel } from "@/lib/order-state"
import { refundIsSettled, refundNeedsAction, refundSideOf, refundWaitingOn } from "@/lib/refund-actions"
import type { AccountId, Refund } from "@/api/generated/types.gen"

/**
 * Refund cases, both the ones you raised and the ones raised against you.
 *
 * Grouped by whose move it is, the same axis the order screen uses — and here it matters
 * more, because every live status names a party and each carries a deadline that party
 * can miss. A seller's silence hands the case to staff; a buyer who never posts the goods
 * back leaves it stalled.
 */
export default function RefundList({ role }: { role?: "buyer" | "seller" }) {
	const { data: me } = useMe()
	const { refunds, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useRefunds()

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
						<Skeleton key={row} className="h-24 w-full rounded-2xl" />
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
					<Group title="CẦN BẠN" rows={needsYou} me={me?.id} highlight />
					<Group title="ĐANG CHỜ" rows={waiting} me={me?.id} />
					<Group title={`XONG (${done.length})`} rows={done} me={me?.id} dim />

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
	highlight = false,
	dim = false,
}: {
	title: string
	rows: Refund[]
	me: AccountId | undefined
	highlight?: boolean
	dim?: boolean
}) {
	if (rows.length === 0) return null

	return (
		<section className="flex flex-col gap-3">
			<WaitingGroupHeader title={title} tone={highlight ? "primary" : "muted"} />

			{rows.map((refund) => {
				const { isBuyer } = refundSideOf(refund, me)
				const left = remainingLabel(refund.deadline_at)

				return (
					<Link
						key={refund.id}
						href={`/account/refunds/${refund.id}`}
						className={`flex flex-col gap-1 p-4 ${rowShell({
							accent: highlight ? "primary" : null,
							dim,
						})}`}
					>
						<div className="flex items-start justify-between gap-3">
							<span className="text-title-sm text-on-surface">
								Đơn {refund.order_id}
							</span>
							<span className="text-label-sm text-on-surface-variant shrink-0">
								{REFUND_STATUS_VI[refund.status]}
							</span>
						</div>

						<p className={highlight ? "text-label-md text-primary" : "text-body-sm text-on-surface-variant"}>
							{refundWaitingOn(refund.status, { isBuyer })}
						</p>

						<p className="text-body-sm text-on-surface-variant line-clamp-1">{refund.reason}</p>

						{left && !dim && (
							<span className="text-label-sm text-error">còn {left}</span>
						)}
					</Link>
				)
			})}
		</section>
	)
}
