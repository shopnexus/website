"use client"

import Link from "next/link"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
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
export default function RefundList() {
	const { data: me } = useMe()
	const { refunds, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useRefunds()

	const needsYou: Refund[] = []
	const waiting: Refund[] = []
	const done: Refund[] = []
	for (const refund of refunds) {
		if (refundIsSettled(refund.status)) done.push(refund)
		else {
			const { isBuyer } = refundSideOf(refund, me?.id)
			;(refundNeedsAction(refund.status, { isBuyer }) ? needsYou : waiting).push(refund)
		}
	}

	return (
		<div className="max-w-[760px] mx-auto px-4 md:px-8 py-8 pb-24 min-h-screen">
			<header className="mb-8">
				<h1 className="font-headline-md text-3xl font-extrabold tracking-tight text-on-surface">
					Yêu cầu hoàn tiền
				</h1>
				<p className="text-body-md text-on-surface-variant mt-1">
					Vụ việc bạn mở, và vụ việc mở trên đơn bạn bán.
				</p>
			</header>

			{isLoading ? (
				<div className="flex flex-col gap-3">
					{[0, 1].map((row) => (
						<Skeleton key={row} className="h-24 w-full rounded-xl" />
					))}
				</div>
			) : refunds.length === 0 ? (
				<div className="text-center py-20 flex flex-col items-center gap-3">
					<span className="material-symbols-outlined text-[48px] text-on-surface-variant">
						receipt_long
					</span>
					<h2 className="font-headline-sm font-bold text-on-surface">Không có yêu cầu nào</h2>
					<p className="text-body-sm text-on-surface-variant max-w-sm">
						Yêu cầu hoàn tiền được mở từ trang chi tiết đơn hàng, sau khi kiện hàng đã rời kho.
					</p>
				</div>
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
			<div className="flex items-center gap-3 pt-2">
				<h2
					className={`font-label-md text-xs font-bold uppercase tracking-[0.08em] ${
						highlight ? "text-primary" : "text-on-surface-variant"
					}`}
				>
					{title}
				</h2>
				<div className={`flex-1 h-px ${highlight ? "bg-primary/30" : "bg-outline-variant/50"}`} />
			</div>

			{rows.map((refund) => {
				const { isBuyer } = refundSideOf(refund, me)
				const left = remainingLabel(refund.deadline_at)

				return (
					<Link
						key={refund.id}
						href={`/refunds/${refund.id}`}
						className={`flex flex-col gap-1 p-4 rounded-xl border transition-colors ${
							highlight
								? "bg-surface border-outline-variant border-l-4 border-l-primary shadow-sm"
								: "bg-surface border-outline-variant/60 hover:border-outline-variant"
						} ${dim ? "opacity-70 hover:opacity-100" : ""}`}
					>
						<div className="flex items-start justify-between gap-3">
							<span className="font-label-md font-bold text-on-surface">
								Đơn {refund.order_id}
							</span>
							<span className="text-xs font-bold text-on-surface-variant shrink-0">
								{REFUND_STATUS_VI[refund.status]}
							</span>
						</div>

						<p className={`text-body-sm ${highlight ? "text-primary font-semibold" : "text-on-surface-variant"}`}>
							{refundWaitingOn(refund.status, { isBuyer })}
						</p>

						<p className="text-body-sm text-on-surface-variant line-clamp-1">{refund.reason}</p>

						{left && !dim && (
							<span className="text-xs font-bold text-error">còn {left}</span>
						)}
					</Link>
				)
			})}
		</section>
	)
}
