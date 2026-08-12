"use client"

import Link from "next/link"
import { useMe } from "@/hooks/api/useAccount"
import { REFUND_STATUS_VI } from "@/lib/dictionaries"
import { refundWaitingOn } from "@/lib/refund-actions"
import type { Order } from "@/api/generated/types.gen"

/**
 * "There is a refund case on this order", and a way into it.
 *
 * Read off the order, which carries its own case: searching the caller's refund list for it
 * meant the notice was missing until that request answered, and missing for good once the
 * list ran past its first page. Without it a seller learns nothing — a case raised against
 * their sale is invisible on the only page they open about that sale, and their 48-hour
 * window runs out while they look at a page that never mentions it.
 */
export default function OrderRefundNotice({ order }: { order: Order }) {
	const { data: me } = useMe()

	const refund = order.refund
	if (!refund) return null

	// The direction the wait is phrased in. The order says which side the reader is on, so
	// the buyer's own id is enough — a moderator is on neither and reads the seller's line.
	const isBuyer = me !== undefined && order.buyer.id === me.id

	return (
		<Link
			href={`/account/refunds/${refund.id}`}
			className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
				refund.settled
					? "border-outline-variant bg-surface-container-low"
					: "border-l-4 border-l-error border-outline-variant bg-error-container/20"
			}`}
		>
			<span
				className={`material-symbols-outlined ${refund.settled ? "text-on-surface-variant" : "text-error"}`}
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
