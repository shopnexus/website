"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import EvidencePicker, { type Evidence } from "./EvidencePicker"
import { useCreateRefund } from "@/hooks/api/useOrders"
import type { OrderId } from "@/api/generated/types.gen"

const MAX_REASON = 2000

/**
 * The buyer opening a refund case.
 *
 * A dialog rather than `window.prompt`, which is what this used to be: the reason runs to
 * two thousand characters and photos may go with it, and neither fits a one-line browser
 * prompt. The seller sees this text and has three days to answer it, so it is worth a box
 * big enough to write in.
 */
export default function RefundDialog({
	orderId,
	open,
	onClose,
}: {
	orderId: OrderId
	open: boolean
	onClose: () => void
}) {
	const router = useRouter()
	const [reason, setReason] = useState("")
	const [evidence, setEvidence] = useState<Evidence[]>([])
	const createRefund = useCreateRefund()

	const submit = () => {
		createRefund.mutate(
			{ orderId, reason: reason.trim(), attachments: evidence.map((item) => item.id) },
			{
				onSuccess: (refund) => {
					toast.success("Đã gửi yêu cầu hoàn tiền")
					setReason("")
					setEvidence([])
					onClose()
					// Straight to the case. Submitting used to drop the buyer back on the order
					// with no sign anything had happened, and nowhere to follow it.
					router.push(`/refunds/${refund.id}`)
				},
			},
		)
	}

	return (
		<Modal open={open} title="Yêu cầu hoàn tiền" onClose={onClose}>
			<div className="flex flex-col gap-5">
				{/* What happens next, so "đang chờ" is not a state the buyer has to guess at. */}
				<p className="text-body-sm text-on-surface-variant">
					Người bán có 3 ngày để trả lời. Họ có thể chấp nhận, hoặc chuyển vụ việc cho
					ShopNexus xem xét — không ai từ chối được yêu cầu của bạn bằng lời của riêng họ.
					Tiền vẫn được giữ cho tới khi có kết luận.
				</p>

				<div className="flex flex-col gap-2">
					<label htmlFor="refund-reason" className="font-label-md font-bold text-on-surface">
						Lý do
					</label>
					<textarea
						id="refund-reason"
						rows={4}
						maxLength={MAX_REASON}
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="Hàng không đúng mô tả, thiếu phụ kiện, hỏng khi nhận..."
						className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md outline-none resize-none transition-all"
					/>
					<span className="text-body-sm text-on-surface-variant self-end">
						{reason.length}/{MAX_REASON}
					</span>
				</div>

				<div className="flex flex-col gap-2">
					<h3 className="font-label-md font-bold text-on-surface">Ảnh chứng minh (không bắt buộc)</h3>
					<EvidencePicker
						evidence={evidence}
						onChange={setEvidence}
						disabled={createRefund.isPending}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Button
						variant="primary"
						fullWidth
						onClick={submit}
						disabled={reason.trim().length === 0 || createRefund.isPending}
					>
						{createRefund.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
					</Button>
					<Button variant="ghost" fullWidth onClick={onClose} disabled={createRefund.isPending}>
						Hủy
					</Button>
				</div>
			</div>
		</Modal>
	)
}
