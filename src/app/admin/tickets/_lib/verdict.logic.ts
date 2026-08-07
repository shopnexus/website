import type { Refund, TicketResolutionAction } from "@/api/generated/types.gen"
import { TICKET_ACTION_VI } from "@/lib/dictionaries"

/**
 * The two ways a case ends, and they are not interchangeable.
 *
 * A hand resolution records what staff did about a complaint. A refund verdict *moves
 * money* — which is why it lives in the order module and is spelled out separately here.
 */

/**
 * What a moderator may record by hand. Narrower than a ticket's own `action_taken`, which
 * also carries the two `refund-*` values: those are written by the refund verdict, and
 * sending one here is a 400 on the field.
 *
 * Each hint says what the value does *not* do — recording is not carrying out. Taking the
 * listing down and suspending the seller are separate calls to the modules that own them,
 * so a moderator who only presses here has recorded a decision nobody executed.
 */
export const RESOLUTION_ACTIONS: ReadonlyArray<{
	value: TicketResolutionAction
	label: string
	hint: string
}> = [
	{
		value: "none",
		label: TICKET_ACTION_VI.none,
		hint: "Đã xem và trả lời, không cần xử lý gì thêm.",
	},
	{
		value: "warning",
		label: TICKET_ACTION_VI.warning,
		hint: "Đã nhắc nhở người bị báo cáo trong cuộc trao đổi.",
	},
	{
		value: "listing-removed",
		label: TICKET_ACTION_VI["listing-removed"],
		hint: "Ghi nhận việc đã gỡ. Thao tác gỡ thực hiện ở màn Tin đăng chờ duyệt.",
	},
	{
		value: "message-removed",
		label: TICKET_ACTION_VI["message-removed"],
		hint: "Ghi nhận việc đã thu hồi tin nhắn vi phạm.",
	},
	{
		value: "account-suspended",
		label: TICKET_ACTION_VI["account-suspended"],
		hint: "Ghi nhận việc đã khoá. Thao tác khoá thực hiện ở màn Tài khoản.",
	},
]

/**
 * What a verdict for the buyer will do, decided entirely by whether the goods have come
 * back — which the ticket's target now carries, so this states the one branch that will
 * happen instead of listing both and leaving the moderator to work out which is theirs.
 */
export function buyerWinBranch(returnedAt: string | null): { when: string; then: string } {
	return returnedAt
		? {
				when: "Hàng đã được hoàn về",
				then: "Trả tiền ký quỹ cho người mua và đóng đơn hàng ngay.",
			}
		: {
				when: "Hàng chưa được hoàn về",
				then: "Chấp nhận hoàn tiền và mở chặng hoàn hàng — tiền vẫn nằm trong ký quỹ cho tới khi hàng về.",
			}
}

/** What actually happened, read off the refund the verdict answered with. */
export function verdictOutcome(refund: Refund): string {
	switch (refund.status) {
		case "returning":
			return "Đã chấp nhận hoàn tiền và mở chặng hoàn hàng. Tiền vẫn trong ký quỹ."
		case "accepted":
			return "Đã trả tiền cho người mua và đóng đơn hàng."
		case "rejected":
			return "Đã từ chối hoàn tiền. Khoản thanh toán cho người bán được giữ nguyên."
		default:
			return "Đã ghi nhận phán quyết."
	}
}
