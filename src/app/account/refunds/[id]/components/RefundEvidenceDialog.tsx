"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import EvidencePicker, { type Evidence } from "@/components/orders/EvidencePicker"
import { useAddRefundAttachments } from "@/hooks/api/useRefunds"
import type { RefundId } from "@/api/generated/types.gen"

/**
 * Adding to a case's evidence while it is open.
 *
 * Either side, deliberately: the route is not narrowed to the buyer, and a seller
 * contesting a claim needs to show something too. Reuses the order upload routes through
 * EvidencePicker — a refund's attachments are order-module resources.
 */
export default function RefundEvidenceDialog({
	refundId,
	open,
	onClose,
}: {
	refundId: RefundId
	open: boolean
	onClose: () => void
}) {
	const [evidence, setEvidence] = useState<Evidence[]>([])
	const addAttachments = useAddRefundAttachments()

	const submit = () => {
		addAttachments.mutate(
			{ id: refundId, attachments: evidence.map((item) => item.id) },
			{
				onSuccess: () => {
					toast.success("Đã bổ sung bằng chứng")
					setEvidence([])
					onClose()
				},
			},
		)
	}

	return (
		<Modal open={open} title="Bổ sung bằng chứng" onClose={onClose}>
			<div className="flex flex-col gap-5">
				<p className="text-body-sm text-on-surface-variant">
					Ảnh bạn thêm sẽ nằm trong hồ sơ vụ việc, và là thứ ShopNexus xem khi phải ra quyết
					định.
				</p>

				<EvidencePicker
					evidence={evidence}
					onChange={setEvidence}
					disabled={addAttachments.isPending}
				/>

				<div className="flex flex-col gap-2">
					<Button
						variant="primary"
						fullWidth
						onClick={submit}
						disabled={evidence.length === 0 || addAttachments.isPending}
					>
						{addAttachments.isPending ? "Đang gửi..." : "Gửi bằng chứng"}
					</Button>
					<Button variant="ghost" fullWidth onClick={onClose} disabled={addAttachments.isPending}>
						Đóng
					</Button>
				</div>
			</div>
		</Modal>
	)
}
