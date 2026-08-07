"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import EvidencePicker, { type Evidence } from "./EvidencePicker"
import { useConfirmReceipt } from "@/hooks/api/useOrders"
import type { OrderId } from "@/api/generated/types.gen"

/**
 * The buyer saying the goods arrived, with the unboxing evidence.
 *
 * A dialog rather than a confirm box because at least one photo is mandatory — the route
 * refuses an empty list, and the web client used to satisfy it by sending a made-up
 * resource id, which the server rejected as an id it could not even parse. So the button
 * looked like it worked and never did.
 *
 * What this screen has to say before it is pressed, and the reason it exists: confirming
 * starts the seller's payout clock and cannot be undone.
 */
export default function ConfirmReceiptDialog({
	orderId,
	open,
	onClose,
}: {
	orderId: OrderId
	open: boolean
	onClose: () => void
}) {
	const [evidence, setEvidence] = useState<Evidence[]>([])
	const confirmReceipt = useConfirmReceipt()

	const submit = () => {
		confirmReceipt.mutate(
			{ orderId, attachments: evidence.map((item) => item.id) },
			{
				onSuccess: () => {
					toast.success("Đã xác nhận nhận hàng")
					setEvidence([])
					onClose()
				},
			},
		)
	}

	return (
		<Modal open={open} title="Đã nhận hàng?" onClose={onClose}>
			<div className="flex flex-col gap-5">
				<p className="text-body-sm text-on-surface-variant">
					Xác nhận sẽ chuyển tiền cho người bán sau 72 giờ và không thể hoàn tác. Nếu có gì
					chưa đúng, hãy yêu cầu hoàn tiền trước khi xác nhận.
				</p>

				<div className="flex flex-col gap-2">
					<h3 className="font-label-md font-bold text-on-surface">Ảnh mở hộp</h3>
					{/* Say why the photo is required, not just that it is: this is the evidence a
					    later refund is judged on, and it is never added to afterwards. */}
					<p className="text-body-sm text-on-surface-variant">
						Cần ít nhất một ảnh. Nếu sau này bạn yêu cầu hoàn tiền, đây là bằng chứng vụ
						việc được xét trên.
					</p>
					<EvidencePicker
						evidence={evidence}
						onChange={setEvidence}
						disabled={confirmReceipt.isPending}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Button
						variant="primary"
						fullWidth
						onClick={submit}
						disabled={evidence.length === 0 || confirmReceipt.isPending}
					>
						{confirmReceipt.isPending ? "Đang gửi..." : "Xác nhận đã nhận hàng"}
					</Button>
					<Button variant="ghost" fullWidth onClick={onClose} disabled={confirmReceipt.isPending}>
						Để sau
					</Button>
				</div>
			</div>
		</Modal>
	)
}
