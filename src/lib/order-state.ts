import type { AccountId, Order, Transport } from "@/api/generated/types.gen"

/**
 * What may be done to an order, derived from the order itself.
 *
 * Three screens render order buttons — the buyer's list, the dashboard feed and the
 * detail page — and each used to decide for itself. They disagreed: only the dashboard
 * offered the seller's 48-hour answer, only the detail page offered a receipt, and none
 * of them offered a cancellation at all, though the route has always been there. So the
 * rules live here once, as plain functions over `Order`, and the buttons are one
 * component built from them.
 *
 * Every predicate mirrors the server's own guard, deliberately: a button is a claim about
 * what the route will accept, and one that asks a question the service does not ask is a
 * 409 the user has to read.
 */

/** `domain.Transport.Shipped` — what makes `Cancel` refuse. `pending` has not moved. */
export function hasShipped(transport: Transport | null): boolean {
	if (!transport) return false
	switch (transport.status) {
		case "picked-up":
		case "in-transit":
		case "delivered":
		case "returned":
		case "failed":
			return true
		default:
			return false
	}
}

/** `domain.Order.Settled` — an outcome was reached and nothing is owed either way. */
export function isFinished(order: Order): boolean {
	return order.state === "completed" || order.state === "cancelled"
}

export function isAwaitingConfirmation(order: Order): boolean {
	return order.state === "awaiting-confirmation"
}

/**
 * The parcel has not left, so the escrow — carriage included — goes back whole.
 *
 * True for **both** parties: the route lets anyone on the order cancel and then refuses
 * on `Cancel(transport.Shipped())`, so the button asks exactly the question the service
 * asks. This is the window that was missing everywhere on the web client.
 */
export function canCancel(order: Order): boolean {
	return !isFinished(order) && !hasShipped(order.transport)
}

/**
 * The buyer saying the goods arrived, which starts the seller's 72-hour payout clock.
 *
 * `state === "open"` is not redundant beside the parcel: it means the seller accepted.
 * Reading the shipment alone let an `awaiting-confirmation` order whose transport row
 * said `delivered` invite a receipt for a sale nobody had confirmed.
 */
export function canConfirmReceipt(order: Order): boolean {
	return (
		order.state === "open" &&
		order.received_at === null &&
		order.transport?.status === "delivered"
	)
}

/**
 * The buyer's other exit, and the complement of {@link canCancel} by design: before the
 * parcel moves a cancellation returns everything at once, and afterwards a refund is the
 * only route the service will take (`CreateRefund` refuses a settled order).
 */
export function canRequestRefund(order: Order): boolean {
	return !isFinished(order) && hasShipped(order.transport)
}

/**
 * Feedback is blind and one submission per direction, so it opens only at the end — and
 * for both sides, since a seller who cannot rate leaves the buyer's rating waiting on the
 * blind window rather than on them.
 *
 * Narrower than the service, which only refuses `open`: a cancelled sale is one that never
 * happened, and offering to rate it invites a score for a parcel nobody sent.
 */
export function canRate(order: Order): boolean {
	return order.state === "completed"
}

/** The outcome first, then the parcel: an order that ended says so whatever the carrier last reported. */
export function orderStatusLabel(order: Order): string {
	if (order.state === "cancelled") return "Đã hủy"
	if (order.state === "completed") return "Hoàn thành"
	// Worded for neither side — who waits on whom is said by orderStatusLine.
	if (order.state === "awaiting-confirmation") return "Chờ xác nhận"
	switch (order.transport?.status) {
		case undefined:
		case null:
			return "Đang xử lý"
		case "pending":
			return "Chờ lấy hàng"
		case "picked-up":
			return "Đã lấy hàng"
		case "in-transit":
			return "Đang giao"
		case "delivered":
			return "Đã giao"
		case "returned":
			return "Đã trả về"
		case "failed":
			return "Giao thất bại"
		case "cancelled":
			return "Vận chuyển đã hủy"
	}
}

/**
 * What a status *means*, so one label never gets two colours and two labels never share
 * one they do not deserve.
 *
 * Lives beside {@link orderStatusLabel} because the two are one decision: the label was
 * rendered `text-primary` at every value it can take, so "Giao thất bại" and "Đã giao"
 * came out identical — a delivery that failed read exactly like one that arrived.
 *
 * `cancelled` is `neutral`, not `danger`. A cancellation is an ordinary way for a sale to
 * end and the money is already back; painting it red tells the reader something broke.
 * Red is kept for the two states where the parcel will not arrive and somebody has to act.
 */
export type OrderStatusTone = "waiting" | "moving" | "success" | "neutral" | "danger"

export function orderStatusTone(order: Order): OrderStatusTone {
	if (order.state === "cancelled") return "neutral"
	if (order.state === "completed") return "success"
	if (order.state === "awaiting-confirmation") return "waiting"

	switch (order.transport?.status) {
		case undefined:
		case null:
		case "pending":
			// Nobody has moved yet: the seller still owes the carrier a parcel.
			return "waiting"
		case "picked-up":
		case "in-transit":
		case "delivered":
			// In motion. `delivered` belongs here rather than in `success` — the goods
			// arrived but the order has not ended, and the buyer still has to confirm.
			return "moving"
		case "returned":
			return "neutral"
		case "failed":
		case "cancelled":
			return "danger"
	}
}

/**
 * The status as a sentence about whose move it is.
 *
 * Two states need one, and they are exactly the two where an order is blocked on a person
 * rather than on a courier — so the sentence names the work instead of the position of the
 * parcel. "Đã giao" beside a button reading "Đã nhận hàng" was a status telling the reader
 * a fact they could see, while the thing they had to *do* went unsaid.
 */
export function orderStatusLine(
	order: Order,
	{ selling, now }: { selling: boolean; now?: number },
): string {
	if (isAwaitingConfirmation(order)) {
		const left = remainingLabel(order.confirmation_deadline_at, now)
		if (selling) return left ? `Cần bạn xác nhận · còn ${left}` : "Cần bạn xác nhận"

		const held = new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: order.currency,
		}).format(order.total)
		return `ShopNexus đang giữ ${held} · chờ người bán xác nhận`
	}

	if (canConfirmReceipt(order)) {
		return selling
			? "Đã giao · chờ người mua xác nhận"
			: "Hàng đã tới — xác nhận để hoàn tất đơn"
	}

	return orderStatusLabel(order)
}

/**
 * "4 giờ", "12 phút", "đã quá hạn" — readable at a glance, because an absolute timestamp
 * makes the reader do the subtraction.
 *
 * `now` is a parameter so a component can pass its ticking clock and stay a pure function
 * of its props; reading it here would make the same render produce different output.
 */
export function remainingLabel(deadline: string | null, now: number = Date.now()): string | null {
	if (!deadline) return null
	const left = new Date(deadline).getTime() - now
	if (left <= 0) return "đã quá hạn"
	const minutes = Math.floor(left / 60_000)
	if (minutes >= 1440) return `${Math.floor(minutes / 1440)} ngày`
	// Two units inside the last day, because one is a lie in both directions here: flooring
	// showed "1 giờ" the instant a two-hour window opened, and rounding up would have told
	// a seller with 61 minutes left that they had two hours.
	if (minutes >= 60) {
		const rest = minutes % 60
		return rest === 0 ? `${minutes / 60} giờ` : `${Math.floor(minutes / 60)} giờ ${rest} phút`
	}
	return `${minutes} phút`
}

/** Which side of the order the viewer is on. Neither, for a moderator or a signed-out reader. */
export function sideOf(order: Order, me: AccountId | undefined) {
	return {
		isBuyer: me !== undefined && order.buyer.id === me,
		isSeller: me !== undefined && order.seller.id === me,
	}
}

/**
 * Câu người mua dặn lúc thanh toán, hoặc "" nếu họ không dặn gì.
 *
 * Ghi chú nằm trên *dòng* chứ không trên đơn: một lượt thanh toán chép cùng một câu lên
 * mọi dòng nó tạo ra (`Note: req.Note` cho từng line), nên dòng nào cũng mang nó. Vẫn gộp
 * theo distinct thay vì lấy `items[0]`: nếu về sau một đơn gom nhiều lượt thanh toán, hai
 * câu dặn khác nhau đều phải tới tay người bán — bỏ mất câu thứ hai còn tệ hơn không hiện
 * câu nào, vì người bán không biết là mình đang thiếu.
 */
export function buyerNote(order: Order): string {
	const notes = new Set<string>()
	for (const item of order.items ?? []) {
		const note = item.note?.trim()
		if (note) notes.add(note)
	}
	return [...notes].join("\n")
}
