import type { AccountId, Order } from "@/api/generated/types.gen"
import { canConfirmReceipt, isAwaitingConfirmation, isFinished } from "./order-state"

/**
 * Whose turn it is — the axis this screen sorts on, in place of "Đơn mua | Đơn bán".
 *
 * Role was never the question. Nobody opens an order screen thinking "show me the selling
 * half"; they open it because something needs them. And the role is already inside the
 * sentence describing the work — "Xác nhận đơn của Minh" can only be a sale, "Xác nhận đã
 * nhận hàng" can only be a purchase — so naming it is repeating what the verb just said.
 *
 * Sorting by turn also puts the seller's 48-hour confirmation deadline and the buyer's
 * delivered parcel on **one** axis, which is what they actually share: act, or lose
 * something. Under the role toggle they sat behind two different switches, so the more
 * urgent of the two could be entirely invisible.
 */
export type WaitingSide = "you" | "other" | "done"

export const WAITING_SIDES: WaitingSide[] = ["you", "other", "done"]

/** `XONG` carries its count because the group is truncated. */
export function waitingGroupTitle(side: WaitingSide, count: number): string {
	switch (side) {
		case "you":
			return "CẦN BẠN"
		case "other":
			return "ĐANG CHỜ"
		case "done":
			return `XONG (${count})`
	}
}

/**
 * The two moments an order is genuinely blocked on the viewer: a seller who has not
 * answered a paid sale, and a buyer whose parcel arrived and whose confirmation releases
 * the money. Everything else in flight is somebody else's move — the other party, the
 * courier, or ShopNexus.
 */
export function waitingSideOf(order: Order, me: AccountId | undefined): WaitingSide {
	if (isFinished(order)) return "done"
	if (order.seller.id === me && isAwaitingConfirmation(order)) return "you"
	if (order.buyer.id === me && canConfirmReceipt(order)) return "you"
	return "other"
}

/**
 * The instant this order runs out, as a sortable number.
 *
 * An order with no clock sorts to the **end** of its group rather than the front: "no
 * deadline" is the least urgent thing there, and a zero would have made it the most.
 */
export function waitingDeadline(order: Order): number {
	const deadline = order.confirmation_deadline_at ?? order.payout_deadline_at
	return deadline ? new Date(deadline).getTime() : Number.POSITIVE_INFINITY
}

/** The deadline to show on a card, or null where the server publishes none. */
export function waitingDeadlineAt(order: Order): string | null {
	return order.confirmation_deadline_at ?? order.payout_deadline_at
}
