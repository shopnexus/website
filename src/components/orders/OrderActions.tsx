"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import ConfirmReceiptDialog from "./ConfirmReceiptDialog"
import DeclineDialog from "./DeclineDialog"
import RateOrderDialog from "./RateOrderDialog"
import RefundDialog from "./RefundDialog"
import { useCancelOrder, useConfirmOrder } from "@/hooks/api/useOrders"
import { useMe } from "@/hooks/api/useAccount"
import {
	canCancel,
	canConfirmReceipt,
	canRate,
	canRequestRefund,
	isAwaitingConfirmation,
	orderStatusLine,
	sideOf,
} from "@/lib/order-state"
import type { Order } from "@/api/generated/types.gen"

/**
 * Everything a party to an order may do about it, in one place.
 *
 * The matrix, so that "what shows when" is a table you can read rather than a stack of
 * nested `if`s spread over three screens:
 *
 * | State                    | Người bán          | Người mua                        |
 * |--------------------------|--------------------|----------------------------------|
 * | chờ xác nhận             | Xác nhận / Từ chối | Hủy đơn                          |
 * | đang mở, chưa lấy hàng   | Hủy đơn            | Hủy đơn                          |
 * | đang mở, đang đi         | —                  | detail: Yêu cầu hoàn tiền        |
 * | đang mở, đã giao         | —                  | Đã nhận hàng / Yêu cầu hoàn tiền |
 * | hoàn thành               | Đánh giá           | Đánh giá                         |
 * | đã hủy                   | —                  | —                                |
 *
 * `variant` decides how much of it appears, not what is true: a **row** carries only the
 * things that move money or have a clock on them, because a list exists so nothing is
 * missed — not so everything can be done from it. The **detail** page carries the rest,
 * where there is enough context to write a refund request or report a problem.
 *
 * A cancellation shows for both sides because the route accepts both and then refuses on
 * `Cancel(transport.Shipped())` — the button asks exactly the question the service asks.
 * It was missing from every web screen, which is what prompted this component.
 */
export default function OrderActions({
	order,
	variant = "row",
	className = "",
}: {
	order: Order
	variant?: "row" | "detail"
	className?: string
}) {
	const { data: me } = useMe()
	const confirmOrder = useConfirmOrder()
	const cancelOrder = useCancelOrder()

	const [dialog, setDialog] = useState<"receipt" | "refund" | "rate" | "decline" | null>(null)
	// The order's own answer, so "is there a case on this sale" is known at the same moment
	// the order is. It used to be searched for in the caller's refund list, which meant the
	// button below was offered until that second request came back — and for ever once the
	// list ran past its first page.
	const refund = order.refund
	const openRefund = refund && !refund.settled ? refund : null

	const { isBuyer, isSeller } = sideOf(order, me?.id)
	// A moderator or a signed-out reader is on neither side and presses nothing.
	if (!isBuyer && !isSeller) return null

	const busy = confirmOrder.isPending || cancelOrder.isPending
	const detail = variant === "detail"
	const size = detail ? "md" : "sm"
	const full = detail

	const cancel = () => {
		if (!window.confirm("Hủy đơn hàng này? Toàn bộ số tiền, kể cả phí vận chuyển, sẽ được hoàn lại."))
			return
		cancelOrder.mutate(order.id, { onSuccess: () => toast.success("Đã hủy đơn hàng") })
	}

	const actions: React.ReactNode[] = []

	if (isSeller && isAwaitingConfirmation(order)) {
		actions.push(
			<Button
				key="confirm"
				variant="primary"
				size={size}
				fullWidth={full}
				disabled={busy}
				onClick={() =>
					confirmOrder.mutate(order.id, { onSuccess: () => toast.success("Đã xác nhận đơn hàng") })
				}
			>
				Xác nhận
			</Button>,
			<Button
				key="decline"
				variant="outline"
				size={size}
				fullWidth={full}
				disabled={busy}
				onClick={() => setDialog("decline")}
			>
				Từ chối
			</Button>,
		)
	} else if (canCancel(order)) {
		// Both sides, and the only window in which it works: after the parcel moves the
		// buyer's route is a refund and the seller's is a ticket.
		actions.push(
			<Button
				key="cancel"
				variant="outline"
				size={size}
				fullWidth={full}
				disabled={busy}
				onClick={cancel}
			>
				Hủy đơn
			</Button>,
		)
	}

	if (isBuyer && canConfirmReceipt(order)) {
		actions.push(
			<Button
				key="receipt"
				variant="primary"
				size={size}
				fullWidth={full}
				disabled={busy}
				onClick={() => setDialog("receipt")}
			>
				Đã nhận hàng
			</Button>,
		)
	}

	// Beside the receipt even in a row: confirming is irreversible, so the alternative has
	// to be on screen at the moment of the decision rather than one page away. Suppressed
	// while a case is *open* and not merely present — `refund_one_active_per_order` covers
	// the unsettled statuses only, so a withdrawn or decided case leaves the route willing
	// to take another one and the button asks the same question the route does.
	if (isBuyer && !openRefund && canRequestRefund(order) && (detail || canConfirmReceipt(order))) {
		actions.push(
			<Button
				key="refund"
				variant="outline"
				size={size}
				fullWidth={full}
				disabled={busy}
				onClick={() => setDialog("refund")}
			>
				Yêu cầu hoàn tiền
			</Button>,
		)
	}

	// The case, settled or not, so a row that no longer offers a refund still leads to the
	// one it already has.
	if (refund) {
		actions.push(
			<Link key="refund-case" href={`/account/refunds/${refund.id}`} className={full ? "block" : ""}>
				<Button variant="outline" size={size} fullWidth={full}>
					Xem yêu cầu hoàn tiền
				</Button>
			</Link>,
		)
	}

	// Both sides rate: feedback is blind and one direction each, so a seller who cannot
	// submit leaves their counterparty's rating waiting on the window instead of on them.
	if (canRate(order)) {
		actions.push(
			<Button
				key="rate"
				variant={detail ? "primary" : "outline"}
				size={size}
				fullWidth={full}
				onClick={() => setDialog("rate")}
			>
				Đánh giá
			</Button>,
		)
	}

	// The one state with a clock on it, said in the terms of whoever is reading: a seller
	// sees what they have left to answer in, a buyer sees who is holding their money.
	const note =
		detail && isAwaitingConfirmation(order) ? orderStatusLine(order, { selling: isSeller }) : null

	if (actions.length === 0 && !note) return null

	return (
		<>
			{note && <p className="text-body-sm text-on-surface-variant mb-1">{note}</p>}
			<div className={`flex ${detail ? "flex-col" : "flex-wrap"} gap-2 ${className}`}>{actions}</div>

			<ConfirmReceiptDialog
				orderId={order.id}
				open={dialog === "receipt"}
				onClose={() => setDialog(null)}
			/>
			<RefundDialog orderId={order.id} open={dialog === "refund"} onClose={() => setDialog(null)} />
			<RateOrderDialog orderId={order.id} open={dialog === "rate"} onClose={() => setDialog(null)} />
			<DeclineDialog orderId={order.id} open={dialog === "decline"} onClose={() => setDialog(null)} />
		</>
	)
}
