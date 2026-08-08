"use client"

import Image from "next/image"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import RefundActions from "./RefundActions"
import { useMe } from "@/hooks/api/useAccount"
import { useRefund } from "@/hooks/api/useRefunds"
import { REFUND_STATUS_VI } from "@/lib/dictionaries"
import { remainingLabel } from "@/lib/order-state"
import { refundIsSettled, refundSideOf, refundWaitingOn } from "@/lib/refund-actions"
import type { RefundStatus } from "@/api/generated/types.gen"

/** Colour by outcome, not by name — a reader scans for "is this still open". */
const STATUS_STYLES: Record<RefundStatus, string> = {
	"awaiting-seller-review": "bg-tertiary-container text-on-tertiary-container",
	returning: "bg-primary/10 text-primary",
	returned: "bg-primary/10 text-primary",
	disputed: "bg-error-container text-on-error-container",
	accepted: "bg-secondary-container text-on-secondary-container",
	rejected: "bg-surface-container-high text-on-surface-variant",
	cancelled: "bg-surface-container-high text-on-surface-variant",
}

export default function RefundDetail({ id }: { id: string }) {
	const { data: me } = useMe()
	const { data: refund, isLoading, isError } = useRefund(id)

	if (isLoading) {
		return (
			<div className="flex flex-col gap-3">
				<Skeleton className="h-6 w-1/2" />
				<Skeleton className="h-4 w-1/3" />
				<Skeleton className="h-24 w-full" />
			</div>
		)
	}

	if (isError || !refund) {
		return (
			<div className="text-center py-16 text-on-surface-variant">
				Không tải được yêu cầu này.
			</div>
		)
	}

	const { isBuyer } = refundSideOf(refund, me?.id)
	const settled = refundIsSettled(refund.status)
	const left = remainingLabel(refund.deadline_at)

	return (
		<div className="flex flex-col gap-6">
			<div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col gap-4">
				<div className="flex items-start justify-between gap-3">
					<div>
						<h1 className="font-headline-sm font-bold text-on-surface">Yêu cầu hoàn tiền</h1>
						<Link
							href={`/account/orders/${refund.order_id}`}
							className="text-body-sm text-primary hover:underline"
						>
							Đơn {refund.order_id}
						</Link>
					</div>
					<span
						className={`text-xs font-bold uppercase tracking-tight px-2 py-1 rounded ${STATUS_STYLES[refund.status]}`}
					>
						{REFUND_STATUS_VI[refund.status]}
					</span>
				</div>

				{/* Whose move it is, in words. The badge answers "where is this"; it does not
				    answer "is this waiting on me". */}
				<p
					className={`font-label-md ${settled ? "text-on-surface-variant" : "text-primary"}`}
				>
					{refundWaitingOn(refund.status, { isBuyer })}
				</p>

				{/* Missing the deadline is itself a move — the seller's silence hands the case
				    to staff, and the inspection window closing refunds the buyer. */}
				{left && !settled && (
					<p className="text-body-sm text-on-surface-variant">
						Hạn phản hồi: còn <span className="font-bold">{left}</span>
					</p>
				)}
			</div>

			<div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col gap-4">
				<div>
					<h2 className="font-label-md font-bold text-on-surface mb-1">Lý do</h2>
					<p className="text-body-md text-on-surface whitespace-pre-wrap">{refund.reason}</p>
				</div>

				{refund.attachments.length > 0 && (
					<div>
						<h2 className="font-label-md font-bold text-on-surface mb-2">Bằng chứng</h2>
						<div className="flex flex-wrap gap-2">
							{refund.attachments.map((attachment) => (
								<div
									key={attachment.id}
									className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant bg-surface-container"
								>
									{/* `url` is empty until the module can presign one. */}
									{attachment.url && (
										<Image src={attachment.url} alt="" fill className="object-cover" />
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			<div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col gap-3">
				<RefundActions refund={refund} isBuyer={isBuyer} />

				{settled && (
					<Link href={`/account/orders/${refund.order_id}`} className="block">
						<Button variant="outline" fullWidth>
							Xem đơn hàng
						</Button>
					</Link>
				)}
			</div>
		</div>
	)
}
