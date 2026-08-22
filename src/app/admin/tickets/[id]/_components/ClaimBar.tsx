"use client"

import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import { useClaimTicket } from "@/hooks/api/useAdminModeration"
import type { AccountSummary, TicketId } from "@/api/generated/types.gen"

/**
 * Taking the case, which is only possible while it is still open — a claim on anything
 * else answers `ticket_not_claimable`, and losing that race means somebody else is
 * already answering it.
 *
 * The requester never learns who claimed it: support answers as the desk, so a decision
 * is the platform's rather than a named person's to argue with afterwards.
 */
export default function ClaimBar({
	ticketId,
	claimable,
	assignee,
}: {
	ticketId: TicketId
	claimable: boolean
	assignee: AccountSummary | null
}) {
	const claim = useClaimTicket()

	if (assignee) {
		return (
			<div className="bg-status-info text-on-status-info rounded-2xl px-4 py-3 flex items-center gap-2 font-label-md">
				<span className="material-symbols-outlined text-[18px]">how_to_reg</span>
				{assignee.name} đang xử lý yêu cầu này.
			</div>
		)
	}

	if (!claimable) return null

	return (
		<div className="bg-status-warn text-on-status-warn rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
			{/* One clause. The second sentence used to explain what the button beside it does,
			    and the button is called "Nhận xử lý". */}
			<span className="font-label-md flex-1 min-w-0">Chưa ai tiếp nhận yêu cầu này.</span>
			<Button
				variant="primary"
				size="sm"
				disabled={claim.isPending}
				onClick={() =>
					claim.mutate(ticketId, {
						onSuccess: () => toast.success("Bạn đã nhận xử lý yêu cầu này."),
					})
				}
			>
				{claim.isPending ? "Đang nhận..." : "Nhận xử lý"}
			</Button>
		</div>
	)
}
