"use client"

import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { buyerWinBranch } from "../../_lib/verdict.logic"

/**
 * The last screen before money moves.
 *
 * A verdict for the buyer does one of two different things and the moderator does not get
 * to choose which: whether the goods have already come back decides it. The applicable one
 * is named outright, because there are no rounds — the case goes terminal, or to a return
 * leg, on this press.
 */
export default function RefundVerdictDialog({
	open,
	buyerWins,
	returnedAt,
	pending,
	onConfirm,
	onClose,
}: {
	open: boolean
	buyerWins: boolean
	/** When the goods came back, or null. Decides which branch the press takes. */
	returnedAt: string | null
	pending: boolean
	onConfirm: () => void
	onClose: () => void
}) {
	const branch = buyerWinBranch(returnedAt)
	return (
		<Modal
			open={open}
			onClose={onClose}
			title={buyerWins ? "Xác nhận hoàn tiền cho người mua?" : "Xác nhận từ chối hoàn tiền?"}
		>
			<div className="flex flex-col gap-4">
				{buyerWins ? (
					<div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
						<div className="font-label-md text-on-surface">{branch.when}</div>
						<div className="font-body-sm text-on-surface-variant mt-0.5">{branch.then}</div>
					</div>
				) : (
					<div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
						<div className="font-label-md text-on-surface">Kết thúc yêu cầu hoàn tiền</div>
						<div className="font-body-sm text-on-surface-variant mt-0.5">
							Người mua không được hoàn tiền, khoản thanh toán cho người bán được giữ
							nguyên.
						</div>
					</div>
				)}

				<p className="font-label-sm text-on-surface-variant">
					Phán quyết này cũng tự động đóng mọi yêu cầu hỗ trợ đang mở về đơn hàng đó, kèm
					ghi chú của bạn. Không thể hoàn tác.
				</p>

				<div className="flex gap-2 justify-end pt-1">
					<Button variant="outline" onClick={onClose} disabled={pending}>
						Huỷ
					</Button>
					<Button
						variant={buyerWins ? "primary" : "error"}
						onClick={onConfirm}
						disabled={pending}
					>
						{pending ? "Đang xử lý..." : "Xác nhận phán quyết"}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
