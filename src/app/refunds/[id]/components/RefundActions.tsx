"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import RefundEvidenceDialog from "./RefundEvidenceDialog"
import {
	useAcceptRefund,
	useReportReturn,
	useWithdrawRefund,
} from "@/hooks/api/useRefunds"
import { refundActionsFor, type RefundAction } from "@/lib/refund-actions"
import type { Refund } from "@/api/generated/types.gen"

/**
 * Every move this side may still make, and nothing else.
 *
 * Driven entirely by `refundActionsFor`, so the buttons and the server's guards cannot
 * drift apart. Before this existed the site offered exactly one of the lifecycle's seven
 * transitions — the buyer raising a case — after which the refund became invisible to
 * both parties and a seller had no way to answer at all.
 */
export default function RefundActions({
	refund,
	isBuyer,
}: {
	refund: Refund
	isBuyer: boolean
}) {
	const [evidenceOpen, setEvidenceOpen] = useState(false)
	const withdraw = useWithdrawRefund()
	const accept = useAcceptRefund()
	const reportReturn = useReportReturn()

	const busy = withdraw.isPending || accept.isPending || reportReturn.isPending
	const actions = refundActionsFor(refund, { isBuyer })

	if (actions.length === 0) return null

	const run = (action: RefundAction) => {
		switch (action) {
			case "withdraw":
				if (!window.confirm("Hủy yêu cầu hoàn tiền? Bạn sẽ không thể mở lại yêu cầu này."))
					return
				withdraw.mutate(refund.id, { onSuccess: () => toast.success("Đã hủy yêu cầu") })
				return
			case "accept":
				// Granting is not paying yet, and saying so here is the point: a seller who
				// reads "chấp nhận" as "mất tiền ngay" will escalate everything instead.
				if (
					!window.confirm(
						"Chấp nhận hoàn tiền?\n\nNgười mua sẽ gửi hàng trả lại. Sau khi bạn xác nhận đã nhận hàng, bạn còn 48 giờ để kiểm tra trước khi tiền được hoàn.",
					)
				)
					return
				accept.mutate(refund.id, { onSuccess: () => toast.success("Đã chấp nhận hoàn tiền") })
				return
			case "report-return-sent":
				reportReturn.mutate(
					{ id: refund.id, status: "picked-up" },
					{ onSuccess: () => toast.success("Đã ghi nhận") },
				)
				return
			case "claim-return-delivered":
				if (
					!window.confirm(
						"Báo hàng đã tới nhưng người bán chưa xác nhận?\n\nViệc này sẽ chuyển vụ việc cho ShopNexus xem xét.",
					)
				)
					return
				reportReturn.mutate(
					{ id: refund.id, status: "delivered" },
					{ onSuccess: () => toast.success("Đã chuyển cho ShopNexus") },
				)
				return
			case "confirm-return-received":
				reportReturn.mutate(
					{ id: refund.id, status: "delivered" },
					{ onSuccess: () => toast.success("Đã xác nhận nhận lại hàng") },
				)
				return
			case "add-evidence":
				setEvidenceOpen(true)
				return
			case "escalate":
				return
		}
	}

	return (
		<>
			<div className="flex flex-col gap-2">
				{actions.map((action) =>
					action === "escalate" ? (
						// Not a route of its own: handing a case to staff *is* opening a
						// `refund-dispute` ticket, and the verdict comes back as that ticket
						// closing. The ref is the **order**, not the refund: a dispute is filed
						// against the sale, which is what lands both parties' complaints about
						// it in one thread. Sending the refund id is `invalid_id`.
						<Link
							key={action}
							href={`/support?kind=refund-dispute&ref_id=${refund.order_id}`}
							className="block"
						>
							<Button variant="outline" fullWidth>
								Nhờ ShopNexus xử lý
							</Button>
						</Link>
					) : (
						<Button
							key={action}
							variant={PRIMARY.has(action) ? "primary" : action === "add-evidence" ? "ghost" : "outline"}
							fullWidth
							disabled={busy}
							onClick={() => run(action)}
						>
							{LABELS[action]}
						</Button>
					),
				)}
			</div>

			<RefundEvidenceDialog
				refundId={refund.id}
				open={evidenceOpen}
				onClose={() => setEvidenceOpen(false)}
			/>
		</>
	)
}

/** The move that ends the wait, per status. Everything else stays quiet beside it. */
const PRIMARY = new Set<RefundAction>(["accept", "confirm-return-received"])

const LABELS: Record<RefundAction, string> = {
	withdraw: "Hủy yêu cầu hoàn tiền",
	accept: "Chấp nhận hoàn tiền",
	escalate: "Nhờ ShopNexus xử lý",
	"report-return-sent": "Tôi đã gửi hàng trả lại",
	"claim-return-delivered": "Hàng đã tới nhưng người bán chưa xác nhận",
	"confirm-return-received": "Đã nhận lại hàng",
	"add-evidence": "Bổ sung ảnh bằng chứng",
}
