"use client"

import { useState } from "react"
import { useOrderFeedback } from "@/hooks/api/useOrders"
import type { OrderId } from "@/api/generated/types.gen"
import RateInviteDialog from "./RateInviteDialog"
import RateOrderDialog from "./RateOrderDialog"

/**
 * Asks for a rating at the one moment it can be given.
 *
 * Not when the buyer presses "Đã nhận hàng": confirming receipt does *not* finish the order,
 * it starts the 72-hour payout clock, and `POST /orders/{id}/feedback` answers 422
 * `order_not_finished` for the whole of it. An invitation into a form the server refuses is
 * worse than no invitation.
 *
 * So the invitation waits here, on the order the buyer opens after the "đơn đã hoàn tất"
 * notification: the order is `completed`, the reader is the buyer, and `mine === null` means
 * they have not rated yet. Once per order per tab — a reader who closed it has answered.
 */
const invited = new Set<string>()

export default function RateInviteGate({
	orderId,
	sellerName,
	isBuyer,
	isCompleted,
}: {
	orderId: OrderId
	sellerName: string
	isBuyer: boolean
	isCompleted: boolean
}) {
	/** The star picked on the invitation; above zero means the form is the open dialog. */
	const [rating, setRating] = useState(0)
	const [dismissed, setDismissed] = useState(false)

	const eligible = isBuyer && isCompleted && !invited.has(orderId) && !dismissed
	const { data: feedback } = useOrderFeedback(eligible ? orderId : undefined)

	// The read is what decides, so an order already rated is never asked again and a failed
	// read stays quiet rather than opening a dialog on a guess. Derived rather than pushed
	// into state by an effect: there is nothing here to keep in sync.
	const inviting = eligible && feedback !== undefined && !feedback.mine

	/** Asked once per order per tab: a reader who closed it has answered. */
	const close = () => {
		invited.add(orderId)
		setDismissed(true)
	}

	return (
		<>
			<RateInviteDialog
				open={rating === 0 && inviting}
				sellerName={sellerName}
				onPick={(picked) => {
					invited.add(orderId)
					setRating(picked)
				}}
				onDismiss={close}
			/>
			<RateOrderDialog
				// Remounted per pick, which is how the picked star becomes the form's initial state.
				key={rating}
				orderId={orderId}
				open={rating > 0}
				initialRating={rating}
				onClose={() => {
					setRating(0)
					close()
				}}
			/>
		</>
	)
}
