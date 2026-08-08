"use client"

import Link from "next/link"
import { useRefunds } from "@/hooks/api/useRefunds"
import { useMe } from "@/hooks/api/useAccount"
import { REFUND_STATUS_VI } from "@/lib/dictionaries"
import { refundIsSettled, refundSideOf, refundWaitingOn } from "@/lib/refund-actions"
import type { OrderId } from "@/api/generated/types.gen"

/**
 * "There is a refund case on this order", and a way into it.
 *
 * `Order` carries no refund field, so the link has to come from the refund side — one
 * cached list read, shared with `/account/refunds`. Without it a seller learns nothing: a case
 * raised against their sale is invisible on the only page they open about that sale, and
 * their 48-hour window runs out while they look at a page that never mentions it.
 */
export default function OrderRefundNotice({ orderId }: { orderId: OrderId }) {
	const { data: me } = useMe()
	const { refunds } = useRefunds()

	const refund = refunds.find((row) => row.order_id === orderId)
	if (!refund) return null

	const { isBuyer } = refundSideOf(refund, me?.id)
	const settled = refundIsSettled(refund.status)

	return (
		<Link
			href={`/account/refunds/${refund.id}`}
			className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
				settled
					? "border-outline-variant bg-surface-container-low"
					: "border-l-4 border-l-error border-outline-variant bg-error-container/20"
			}`}
		>
			<span
				className={`material-symbols-outlined ${settled ? "text-on-surface-variant" : "text-error"}`}
			>
				assignment_return
			</span>
			<div className="flex flex-col gap-0.5 min-w-0">
				<span className="font-label-md text-on-surface">
					Yêu cầu hoàn tiền · {REFUND_STATUS_VI[refund.status]}
				</span>
				<span className="text-body-sm text-on-surface-variant">
					{refundWaitingOn(refund.status, { isBuyer })}
				</span>
			</div>
		</Link>
	)
}
