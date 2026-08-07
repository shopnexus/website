import type { AccountId, Refund, RefundStatus } from "@/api/generated/types.gen"

/**
 * What each side may still do to a refund.
 *
 * The same matrix the Flutter app carries (`lib/features/refund/domain/refund_actions.dart`),
 * and for the same reason: every row here is a guard that exists in the server's service
 * layer, not a guess about the UI. A button asking a question the service does not ask
 * trades a tap for a 403.
 *
 * The two rules worth stating outright, because both clients got them wrong: the seller
 * has **no way to refuse** a refund — granting it and handing it to staff are their only
 * moves — and the buyer can **never escalate**, because that route is seller-only.
 */
export type RefundAction =
	/** The buyer dropping the case, and only before the seller has decided. */
	| "withdraw"
	/** The seller granting it. Their only way to end the case themselves. */
	| "accept"
	/** The seller handing it to staff. Not a route of its own — it opens a `refund-dispute` ticket. */
	| "escalate"
	/** The buyer reporting the goods are on their way back. */
	| "report-return-sent"
	/** The buyer claiming the return arrived. The seller has not confirmed, so this goes to staff. */
	| "claim-return-delivered"
	/** The seller acknowledging the return, which opens their 48-hour inspection window. */
	| "confirm-return-received"
	/** Either party, any live status. */
	| "add-evidence"

export function refundIsSettled(status: RefundStatus): boolean {
	return status === "accepted" || status === "rejected" || status === "cancelled"
}

export function refundActionsFor(refund: Refund, { isBuyer }: { isBuyer: boolean }): RefundAction[] {
	if (refundIsSettled(refund.status)) return []

	switch (refund.status) {
		// The seller grants it or hands it to staff; the buyer withdraws. Letting the 48
		// hours lapse also hands it to staff, so doing nothing is not a third option.
		case "awaiting-seller-review":
			return isBuyer ? ["withdraw", "add-evidence"] : ["accept", "escalate", "add-evidence"]

		// No carrier is ever booked for the return leg, so the two parties report it
		// themselves. That is also why these buttons have to exist: without them the case
		// stops here forever — `returning` carries no deadline, so no sweep frees it.
		case "returning":
			return isBuyer
				? ["report-return-sent", "claim-return-delivered", "add-evidence"]
				: ["confirm-return-received", "add-evidence"]

		// The seller is inspecting and may still contest until the window closes; letting
		// it close refunds the buyer automatically.
		case "returned":
			return isBuyer ? ["add-evidence"] : ["escalate", "add-evidence"]

		// Staff hold it. Neither side decides anything, but either may still file evidence
		// for whoever will read it.
		case "disputed":
			return ["add-evidence"]

		default:
			return []
	}
}

/**
 * Whether the case is waiting on *this* viewer.
 *
 * Not "does this side have any button": a buyer whose seller has not answered can still
 * withdraw, but nothing is owed by them — grouping on the button list put such a case
 * under "CẦN BẠN" beside a line reading "Đang chờ người bán trả lời". Every live status
 * names one party, which is what this reads, so the group and the sentence cannot
 * disagree.
 */
export function refundNeedsAction(status: RefundStatus, { isBuyer }: { isBuyer: boolean }): boolean {
	switch (status) {
		case "awaiting-seller-review":
			return !isBuyer
		case "returning":
			return isBuyer
		case "returned":
			return !isBuyer
		// Staff hold it, and the terminals are over.
		default:
			return false
	}
}

/** Who the clock is pointing at, said in words rather than left for the reader to infer. */
export function refundWaitingOn(status: RefundStatus, { isBuyer }: { isBuyer: boolean }): string {
	switch (status) {
		case "awaiting-seller-review":
			return isBuyer ? "Đang chờ người bán trả lời" : "Đang chờ bạn trả lời"
		case "returning":
			return isBuyer ? "Bạn cần gửi hàng trả lại người bán" : "Đang chờ hàng được trả về"
		case "returned":
			return isBuyer ? "Người bán đang kiểm tra hàng trả về" : "Bạn đang kiểm tra hàng trả về"
		case "disputed":
			return "ShopNexus đang xem xét vụ việc"
		case "accepted":
			return "Đã hoàn tiền cho người mua"
		case "rejected":
			return "Yêu cầu không được chấp nhận"
		case "cancelled":
			return "Người mua đã rút yêu cầu"
	}
}

/** Which side of the refund the viewer is on. A refund row records only the buyer. */
export function refundSideOf(refund: Refund, me: AccountId | undefined) {
	return { isBuyer: me !== undefined && refund.buyer_id === me }
}
