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
	/**
	 * The buyer adding to their evidence.
	 *
	 * Theirs alone: `attachments` is the claim being made, not a shared case file. The
	 * seller answers by opening a `refund-dispute` ticket, whose thread carries their
	 * evidence — so the two sides stay legible apart.
	 */
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
			return isBuyer ? ["withdraw", "add-evidence"] : ["accept", "escalate"]

		// No carrier is ever booked for the return leg, so the two parties report it
		// themselves. That is also why these buttons have to exist: without them the case
		// stops here forever — `returning` carries no deadline, so no sweep frees it.
		case "returning":
			return isBuyer
				? ["report-return-sent", "claim-return-delivered", "add-evidence"]
				: ["confirm-return-received"]

		// The seller is inspecting and may still contest until the window closes; letting
		// it close refunds the buyer automatically.
		case "returned":
			return isBuyer ? ["add-evidence"] : ["escalate"]

		// Staff hold it. Neither side decides anything; the buyer may still file evidence
		// for whoever will read it, and the seller already has their ticket thread.
		case "disputed":
			return isBuyer ? ["add-evidence"] : []

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

/**
 * The moves that change the case's state.
 *
 * Everything `refundActionsFor` allows except adding evidence, which the detail screen
 * offers beside the evidence itself rather than in the decision stack: a photo is part of
 * the claim, not a decision about it, and listing it with "chấp nhận hoàn tiền" made the
 * two read as equal weight.
 */
export type RefundDecision = Exclude<RefundAction, "add-evidence">

export function refundDecisionsFor(
	refund: Refund,
	{ isBuyer }: { isBuyer: boolean },
): RefundDecision[] {
	return refundActionsFor(refund, { isBuyer }).filter(
		(action): action is RefundDecision => action !== "add-evidence",
	)
}

export function refundCanAddEvidence(refund: Refund, { isBuyer }: { isBuyer: boolean }): boolean {
	return refundActionsFor(refund, { isBuyer }).includes("add-evidence")
}

/**
 * What happens next, including what happens if nobody does anything.
 *
 * Every live status is a clock somebody can let run out, and running out is a *decision*
 * here — the seller's silence hands the case to staff, the inspection window closing pays
 * the buyer. A screen that shows only buttons tells the half of the story where somebody
 * acts, which is why a disputed case, where neither side has a button, rendered an empty
 * card.
 */
export function refundNextStep(status: RefundStatus, { isBuyer }: { isBuyer: boolean }): string {
	switch (status) {
		case "awaiting-seller-review":
			return isBuyer
				? "Người bán có 48 giờ để trả lời. Nếu họ im lặng đến hết hạn, ShopNexus sẽ tự tiếp nhận vụ việc — bạn không phải làm gì thêm."
				: "Bạn có 48 giờ để chấp nhận hoàn tiền hoặc nhờ ShopNexus xử lý. Quá hạn mà không trả lời, vụ việc tự động chuyển cho ShopNexus."
		case "returning":
			return isBuyer
				? "Gửi hàng về cho người bán rồi báo lại ở đây. Không có hạn nào chạy trong lúc hàng đang trên đường."
				: "Đang chờ hàng về. Khi nhận được, hãy xác nhận để mở 48 giờ kiểm tra hàng."
		case "returned":
			return isBuyer
				? "Người bán có 48 giờ để kiểm tra hàng. Hết hạn mà họ không phản hồi, tiền sẽ được hoàn cho bạn."
				: "Bạn có 48 giờ để kiểm tra. Nếu hàng về không đúng như bằng chứng người mua đưa ra, hãy nhờ ShopNexus xử lý; im lặng đến hết hạn thì tiền sẽ hoàn cho người mua."
		case "disputed":
			return isBuyer
				? "ShopNexus đang đọc bằng chứng của cả hai bên. Bạn không phải làm gì thêm, nhưng vẫn có thể bổ sung ảnh trong lúc chờ. Kết quả sẽ được trả lời trong yêu cầu hỗ trợ của vụ việc."
				: "ShopNexus đang đọc bằng chứng của cả hai bên. Kết quả sẽ được trả lời trong yêu cầu hỗ trợ của vụ việc."
		case "accepted":
			return isBuyer
				? "Tiền đã được hoàn về ví của bạn. Vụ việc khép lại tại đây."
				: "Tiền đã được hoàn cho người mua. Vụ việc khép lại tại đây."
		case "rejected":
			return "ShopNexus kết luận không hoàn tiền cho vụ việc này. Đơn hàng giữ nguyên."
		case "cancelled":
			return isBuyer
				? "Bạn đã rút yêu cầu trước khi người bán trả lời. Đơn hàng giữ nguyên."
				: "Người mua đã rút yêu cầu trước khi bạn trả lời. Đơn hàng giữ nguyên."
	}
}
